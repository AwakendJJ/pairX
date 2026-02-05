// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PairXEscrow
 * @notice P2P DEX escrow contract for Arc L1 with native USDC settlement
 * @dev Arc L1 uses USDC as native gas token - msg.value represents USDC (18 decimals)
 * 
 * Arc L1 Specifications:
 * - Chain ID: 5042002 (Testnet)
 * - Native Gas Token: USDC (NOT ETH)
 * - USDC System Contract: 0x3600000000000000000000000000000000000000
 * - msg.value = USDC amount (18 decimals)
 * - No IERC20 transfers needed for native token
 * 
 * Security:
 * - Uses OpenZeppelin's ReentrancyGuard to prevent reentrancy attacks
 * - Follows checks-effects-interactions pattern
 * - Pausable mechanism for emergency stops (admin only)
 * - Ownable for admin access control
 */
contract PairXEscrow is ReentrancyGuard, Pausable, Ownable {
    
    /**
     * @notice Trade lifecycle states
     * @dev State machine for P2P escrow trades
     */
    enum TradeState {
        OPEN,       // Trade created, USDC deposited by Seller, awaiting Buyer
        LOCKED,     // Buyer accepted trade, waiting for off-chain payment
        PAID,       // Buyer marked payment as sent, Seller must verify and release
        RELEASED,   // Trade completed, USDC transferred to Buyer
        CANCELLED,  // Trade cancelled by Seller (only from OPEN state)
        DISPUTED    // Dispute triggered (timeout or manual flag)
    }

    /**
     * @notice State Transition Rules
     * @dev Valid state transitions for the escrow system
     * 
     * State Transition Diagram:
     * 
     *                    ┌──────────┐
     *                    │   OPEN   │
     *                    └────┬─────┘
     *                         │
     *              ┌──────────┼──────────┐
     *              │          │          │
     *         (Seller)    (Buyer)        │
     *          cancel    acceptTrade     │
     *              │          │          │
     *              ▼          ▼          │
     *        ┌──────────┐ ┌────────┐    │
     *        │CANCELLED │ │ LOCKED │    │
     *        └──────────┘ └───┬────┘    │
     *                         │         │
     *                    (Buyer)        │
     *                  markAsPaid       │
     *                         │         │
     *                         ▼         │
     *                    ┌────────┐     │
     *                    │  PAID  │     │
     *                    └───┬────┘     │
     *                        │          │
     *              ┌─────────┼─────┐    │
     *              │         │     │    │
     *         (Seller)   (Timeout) │    │
     *          release    dispute  │    │
     *              │         │     │    │
     *              ▼         ▼     │    │
     *        ┌──────────┐┌────────┐│    │
     *        │RELEASED  ││DISPUTED││    │
     *        └──────────┘└────────┘│    │
     *                              │    │
     *                         (Admin)   │
     *                      resolveDispute
     *                              │    │
     *                              └────┘
     * 
     * Allowed Transitions:
     * - OPEN → LOCKED:     Buyer accepts trade
     * - OPEN → CANCELLED:  Seller cancels (before buyer acceptance)
     * - LOCKED → PAID:     Buyer marks payment as sent
     * - PAID → RELEASED:   Seller releases USDC to buyer
     * - PAID → DISPUTED:   Timeout triggers dispute
     * - DISPUTED → RELEASED: Admin resolves in buyer's favor
     * - DISPUTED → CANCELLED: Admin resolves in seller's favor (refund)
     * 
     * Access Control:
     * - Only Seller can: cancel() [from OPEN], release() [from PAID]
     * - Only Buyer can: acceptTrade() [from OPEN], markAsPaid() [from LOCKED]
     * - Only Admin can: resolveDispute() [from DISPUTED]
     * - Anyone can: disputeTimeout() [from PAID after timeout]
     * 
     * Security Notes:
     * - Once Buyer accepts (LOCKED state), Seller CANNOT cancel
     * - PAID state has timeout mechanism to protect buyer
     * - All state transitions emit events for transparency
     * - Reentrancy protection on all fund transfers
     */

    // Contract version
    string public constant VERSION = "1.0.0";
    
    // Arc L1 native USDC system contract address (for reference)
    address public constant USDC_SYSTEM_CONTRACT = 0x3600000000000000000000000000000000000000;
    
    // Timeout duration for dispute mechanism (24 hours)
    uint256 public constant TIMEOUT_DURATION = 24 hours;
    
    /**
     * @notice Trade struct containing all trade information
     * @dev Stores complete trade lifecycle data
     */
    struct Trade {
        uint256 tradeId;           // Unique trade identifier
        address seller;            // Address of the seller (maker)
        address buyer;             // Address of the buyer (taker) - set when trade is accepted
        uint256 amount;            // USDC amount (18 decimals) - native token on Arc L1
        TradeState state;          // Current state of the trade
        uint256 createdAt;         // Timestamp when trade was created
        uint256 lockedAt;          // Timestamp when buyer accepted trade (0 if not accepted yet)
        uint256 paidAt;            // Timestamp when buyer marked as paid (0 if not paid yet)
        string paymentMethod;      // Off-chain payment method details (e.g., "Bank Transfer", "PayPal")
    }
    
    // Events
    
    /**
     * @notice Emitted when a new trade is created
     * @param tradeId Unique identifier for the trade
     * @param seller Address of the seller (maker)
     * @param amount USDC amount deposited (18 decimals)
     * @param paymentMethod Off-chain payment method details
     * @param timestamp Block timestamp when trade was created
     */
    event TradeCreated(
        uint256 indexed tradeId,
        address indexed seller,
        uint256 amount,
        string paymentMethod,
        uint256 timestamp
    );
    
    /**
     * @notice Emitted when a buyer accepts a trade
     * @param tradeId Unique identifier for the trade
     * @param buyer Address of the buyer (taker)
     * @param timestamp Block timestamp when trade was accepted
     */
    event TradeAccepted(
        uint256 indexed tradeId,
        address indexed buyer,
        uint256 timestamp
    );
    
    /**
     * @notice Emitted when a buyer marks payment as sent
     * @param tradeId Unique identifier for the trade
     * @param buyer Address of the buyer who marked payment as sent
     * @param timestamp Block timestamp when payment was marked
     */
    event TradePaid(
        uint256 indexed tradeId,
        address indexed buyer,
        uint256 timestamp
    );
    
    /**
     * @notice Emitted when seller releases USDC to buyer
     * @param tradeId Unique identifier for the trade
     * @param seller Address of the seller who released funds
     * @param buyer Address of the buyer receiving funds
     * @param amount USDC amount released (18 decimals)
     * @param timestamp Block timestamp when funds were released
     */
    event TradeReleased(
        uint256 indexed tradeId,
        address indexed seller,
        address indexed buyer,
        uint256 amount,
        uint256 timestamp
    );
    
    /**
     * @notice Emitted when seller cancels a trade
     * @param tradeId Unique identifier for the trade
     * @param seller Address of the seller who cancelled
     * @param amount USDC amount refunded (18 decimals)
     * @param timestamp Block timestamp when trade was cancelled
     */
    event TradeCancelled(
        uint256 indexed tradeId,
        address indexed seller,
        uint256 amount,
        uint256 timestamp
    );
    
    /**
     * @notice Emitted when a dispute is triggered due to timeout
     * @param tradeId Unique identifier for the trade
     * @param triggeredBy Address that triggered the dispute
     * @param timestamp Block timestamp when dispute was triggered
     */
    event DisputeTriggered(
        uint256 indexed tradeId,
        address indexed triggeredBy,
        uint256 timestamp
    );
    
    /**
     * @notice Emitted when admin resolves a dispute
     * @param tradeId Unique identifier for the trade
     * @param winner Address that received the funds (buyer or seller)
     * @param amount USDC amount transferred (18 decimals)
     * @param timestamp Block timestamp when dispute was resolved
     */
    event DisputeResolved(
        uint256 indexed tradeId,
        address indexed winner,
        uint256 amount,
        uint256 timestamp
    );
    
    // State variables
    
    /**
     * @notice Mapping from trade ID to Trade struct
     * @dev Public mapping allows anyone to read trade details
     */
    mapping(uint256 => Trade) public trades;
    
    /**
     * @notice Counter for generating unique trade IDs
     * @dev Increments with each new trade, starts at 1
     */
    uint256 public nextTradeId = 1;
    
    /**
     * @notice Mapping to track completed trades per address (reputation system)
     * @dev Incremented for both buyer and seller when trade is released
     */
    mapping(address => uint256) public completedTrades;
    
    /**
     * @dev Contract constructor
     * @notice Initializes the PairX escrow contract on Arc L1
     * @param initialOwner Address that will be set as the contract owner (admin)
     */
    constructor(address initialOwner) Ownable(initialOwner) {
        // Trade ID counter initialized to 1
        // Mapping and other state variables auto-initialized
        // Owner set by Ownable constructor
    }
    
    // Modifiers
    
    /**
     * @notice Modifier to restrict function access to seller only
     * @dev Validates that msg.sender is the seller of the specified trade
     * @param tradeId The ID of the trade to check
     */
    modifier onlySeller(uint256 tradeId) {
        require(tradeId > 0 && tradeId < nextTradeId, "Trade does not exist");
        require(msg.sender == trades[tradeId].seller, "Only seller can call this function");
        _;
    }
    
    /**
     * @notice Modifier to restrict function access to buyer only
     * @dev Validates that msg.sender is the buyer of the specified trade
     * @param tradeId The ID of the trade to check
     */
    modifier onlyBuyer(uint256 tradeId) {
        require(tradeId > 0 && tradeId < nextTradeId, "Trade does not exist");
        require(msg.sender == trades[tradeId].buyer, "Only buyer can call this function");
        _;
    }
    
    /**
     * @notice Modifier to validate trade is in expected state
     * @dev Ensures state transitions only occur from valid states
     * @param tradeId The ID of the trade to check
     * @param expectedState The required state for the operation
     */
    modifier inState(uint256 tradeId, TradeState expectedState) {
        require(tradeId > 0 && tradeId < nextTradeId, "Trade does not exist");
        require(trades[tradeId].state == expectedState, "Invalid trade state for this operation");
        _;
    }
    
    // Core Functions
    
    /**
     * @notice Create a new trade offer by depositing USDC
     * @dev Seller deposits USDC via msg.value (Arc L1 native token)
     * @param paymentMethod Off-chain payment method details (e.g., "Bank Transfer - Chase", "PayPal - user@email.com")
     * @return tradeId The ID of the newly created trade
     * 
     * Requirements:
     * - Contract must not be paused
     * - msg.value must be greater than 0
     * - paymentMethod must not be empty
     * 
     * State Changes:
     * - Creates new Trade in OPEN state
     * - Increments nextTradeId
     * - Transfers USDC from seller to contract
     * 
     * Emits:
     * - TradeCreated event
     * 
     * Security:
     * - whenNotPaused modifier prevents creation during emergency pause
     */
    function createTrade(string calldata paymentMethod) external payable whenNotPaused returns (uint256) {
        // Validate amount
        require(msg.value > 0, "Amount must be greater than 0");
        
        // Validate payment method
        require(bytes(paymentMethod).length > 0, "Payment method cannot be empty");
        
        // Get current trade ID and increment counter
        uint256 tradeId = nextTradeId;
        nextTradeId++;
        
        // Create new trade in OPEN state
        trades[tradeId] = Trade({
            tradeId: tradeId,
            seller: msg.sender,
            buyer: address(0),              // No buyer yet (set when accepted)
            amount: msg.value,              // USDC amount (native token on Arc L1)
            state: TradeState.OPEN,         // Initial state
            createdAt: block.timestamp,     // Current block timestamp
            lockedAt: 0,                    // Not locked yet
            paidAt: 0,                      // Not paid yet
            paymentMethod: paymentMethod    // Off-chain payment details
        });
        
        // Emit event
        emit TradeCreated(
            tradeId,
            msg.sender,
            msg.value,
            paymentMethod,
            block.timestamp
        );
        
        return tradeId;
    }
    
    /**
     * @notice Accept a trade as a buyer (transition from OPEN to LOCKED)
     * @dev Buyer locks the trade by accepting it, preventing seller from cancelling
     * @param tradeId The ID of the trade to accept
     * 
     * Requirements:
     * - Contract must not be paused
     * - Trade must exist
     * - Trade must be in OPEN state (enforced by inState modifier)
     * - Caller cannot be the seller
     * 
     * State Changes:
     * - Sets buyer address to msg.sender
     * - Transitions state to LOCKED
     * - Records acceptance timestamp
     * 
     * Emits:
     * - TradeAccepted event
     * 
     * Security:
     * - nonReentrant modifier prevents reentrancy attacks
     * - inState modifier validates correct state transition
     * - whenNotPaused modifier prevents acceptance during emergency pause
     */
    function acceptTrade(uint256 tradeId) external nonReentrant whenNotPaused inState(tradeId, TradeState.OPEN) {
        Trade storage trade = trades[tradeId];
        
        // Prevent seller from accepting their own trade
        require(msg.sender != trade.seller, "Seller cannot accept their own trade");
        
        // Set buyer and update state
        trade.buyer = msg.sender;
        trade.state = TradeState.LOCKED;
        trade.lockedAt = block.timestamp;
        
        // Emit event
        emit TradeAccepted(tradeId, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Mark payment as sent by buyer (transition from LOCKED to PAID)
     * @dev Buyer signals they have completed the off-chain payment (bank transfer, PayPal, etc.)
     * @param tradeId The ID of the trade to mark as paid
     * 
     * Requirements:
     * - Trade must exist
     * - Trade must be in LOCKED state (enforced by inState modifier)
     * - Caller must be the buyer (enforced by onlyBuyer modifier)
     * 
     * State Changes:
     * - Transitions state to PAID
     * - Records payment timestamp
     * 
     * Emits:
     * - TradePaid event
     * 
     * Security Notes:
     * - Once marked as paid, seller can release funds or timeout can trigger dispute
     * - This function only updates on-chain state - actual payment verification happens off-chain
     * - onlyBuyer modifier enforces access control
     * - inState modifier validates correct state transition
     */
    function markAsPaid(uint256 tradeId) external onlyBuyer(tradeId) inState(tradeId, TradeState.LOCKED) {
        Trade storage trade = trades[tradeId];
        
        // Update state to PAID
        trade.state = TradeState.PAID;
        trade.paidAt = block.timestamp;
        
        // Emit event
        emit TradePaid(tradeId, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Release USDC to buyer after confirming off-chain payment (transition from PAID to RELEASED)
     * @dev Seller confirms receipt of off-chain payment and releases escrowed USDC to buyer
     * @param tradeId The ID of the trade to release
     * 
     * Requirements:
     * - Trade must exist
     * - Trade must be in PAID state (enforced by inState modifier)
     * - Caller must be the seller (enforced by onlySeller modifier)
     * 
     * State Changes:
     * - Transitions state to RELEASED
     * - Transfers USDC to buyer (native token on Arc L1)
     * - Increments seller's completed trade count (reputation)
     * - Increments buyer's completed trade count (reputation)
     * 
     * Emits:
     * - TradeReleased event
     * 
     * Security Notes:
     * - This is the successful completion path for a trade
     * - Uses native USDC transfer (msg.value on Arc L1)
     * - Reputation counters incremented for both parties
     * - nonReentrant modifier prevents reentrancy attacks
     * - onlySeller modifier enforces access control
     * - inState modifier validates correct state transition
     */
    function release(uint256 tradeId) external nonReentrant onlySeller(tradeId) inState(tradeId, TradeState.PAID) {
        Trade storage trade = trades[tradeId];
        
        // Update state to RELEASED before transfer (checks-effects-interactions pattern)
        trade.state = TradeState.RELEASED;
        
        // Increment reputation counters for both parties
        completedTrades[trade.seller]++;
        completedTrades[trade.buyer]++;
        
        // Cache amount for transfer
        uint256 amount = trade.amount;
        address buyer = trade.buyer;
        
        // Transfer USDC to buyer (native token on Arc L1)
        payable(buyer).transfer(amount);
        
        // Emit event
        emit TradeReleased(tradeId, msg.sender, buyer, amount, block.timestamp);
    }
    
    /**
     * @notice Cancel a trade and refund seller (only allowed from OPEN state)
     * @dev Seller can cancel trade only before buyer accepts - prevents rug pulls
     * @param tradeId The ID of the trade to cancel
     * 
     * Requirements:
     * - Trade must exist
     * - Trade must be in OPEN state (enforced by inState modifier - cannot cancel after buyer accepts)
     * - Caller must be the seller (enforced by onlySeller modifier)
     * 
     * State Changes:
     * - Transitions state to CANCELLED
     * - Refunds USDC to seller (native token on Arc L1)
     * 
     * Emits:
     * - TradeCancelled event
     * 
     * Security Notes:
     * - CRITICAL: Once buyer accepts (LOCKED state), seller CANNOT cancel
     * - This protects buyer from seller backing out after commitment
     * - Follows checks-effects-interactions pattern to prevent reentrancy
     * - nonReentrant modifier provides additional protection
     * - onlySeller modifier enforces access control
     * - inState modifier validates correct state transition
     */
    function cancel(uint256 tradeId) external nonReentrant onlySeller(tradeId) inState(tradeId, TradeState.OPEN) {
        Trade storage trade = trades[tradeId];
        
        // Update state to CANCELLED before refund (checks-effects-interactions pattern)
        trade.state = TradeState.CANCELLED;
        
        // Cache amount and seller for refund
        uint256 amount = trade.amount;
        address seller = trade.seller;
        
        // Refund USDC to seller (native token on Arc L1)
        payable(seller).transfer(amount);
        
        // Emit event
        emit TradeCancelled(tradeId, seller, amount, block.timestamp);
    }
    
    /**
     * @notice Get trade details by ID
     * @dev Helper function to retrieve complete trade information
     * @param tradeId The ID of the trade to retrieve
     * @return Trade struct containing all trade details
     */
    function getTrade(uint256 tradeId) external view returns (Trade memory) {
        require(tradeId > 0 && tradeId < nextTradeId, "Trade does not exist");
        return trades[tradeId];
    }
    
    /**
     * @notice Get reputation (completed trade count) for an address
     * @dev Returns the number of successfully completed trades for a given address
     * @param user The address to check reputation for
     * @return uint256 Number of completed trades
     */
    function getReputation(address user) external view returns (uint256) {
        return completedTrades[user];
    }
    
    /**
     * @notice Get current trade count
     * @dev Returns the number of trades created (nextTradeId - 1)
     * @return uint256 Total number of trades created
     */
    function getTradeCount() external view returns (uint256) {
        return nextTradeId - 1;
    }
    
    /**
     * @notice Get contract's native USDC balance
     * @dev Returns the amount of USDC held in escrow by the contract
     * @return uint256 Contract balance in USDC (18 decimals)
     * 
     * Note:
     * - On Arc L1, address(this).balance represents native USDC, not ETH
     * - This is the total amount held in escrow across all active trades
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice Check if a trade has timed out
     * @dev View function to check if timeout duration has elapsed since payment was marked
     * @param tradeId The ID of the trade to check
     * @return bool True if trade has timed out, false otherwise
     * 
     * Requirements:
     * - Trade must exist
     * - Trade must be in PAID state
     * 
     * Returns:
     * - True if more than TIMEOUT_DURATION has passed since paidAt timestamp
     * - False otherwise
     */
    function checkTimeout(uint256 tradeId) public view returns (bool) {
        require(tradeId > 0 && tradeId < nextTradeId, "Trade does not exist");
        
        Trade storage trade = trades[tradeId];
        
        // Only PAID state can timeout
        if (trade.state != TradeState.PAID) {
            return false;
        }
        
        // Check if timeout duration has elapsed
        return block.timestamp >= trade.paidAt + TIMEOUT_DURATION;
    }
    
    /**
     * @notice Trigger dispute due to timeout (transition from PAID to DISPUTED)
     * @dev Anyone can call this after timeout period to protect buyer
     * @param tradeId The ID of the trade to dispute
     * 
     * Requirements:
     * - Trade must exist
     * - Trade must be in PAID state
     * - Timeout duration must have elapsed
     * 
     * State Changes:
     * - Transitions state to DISPUTED
     * 
     * Emits:
     * - DisputeTriggered event
     * 
     * Security Notes:
     * - Anyone can trigger timeout dispute (not just buyer)
     * - This protects buyer if seller doesn't release funds
     * - Requires admin intervention to resolve dispute
     */
    function disputeTimeout(uint256 tradeId) external inState(tradeId, TradeState.PAID) {
        // Check if timeout has occurred
        require(checkTimeout(tradeId), "Timeout period has not elapsed");
        
        Trade storage trade = trades[tradeId];
        
        // Transition to DISPUTED state
        trade.state = TradeState.DISPUTED;
        
        // Emit event
        emit DisputeTriggered(tradeId, msg.sender, block.timestamp);
    }
    
    // Admin Functions
    
    /**
     * @notice Pause the contract in case of emergency
     * @dev Only callable by contract owner (admin)
     * 
     * Effects:
     * - Prevents new trades from being created
     * - Prevents trades from being accepted
     * - Release and cancel functions remain available for existing trades
     * 
     * Security:
     * - Only owner can pause
     * - Used in emergency situations (critical bugs, exploits)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the contract after emergency is resolved
     * @dev Only callable by contract owner (admin)
     * 
     * Effects:
     * - Re-enables trade creation and acceptance
     * 
     * Security:
     * - Only owner can unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Resolve a disputed trade (admin only)
     * @dev Admin can release funds to buyer or refund to seller based on investigation
     * @param tradeId The ID of the disputed trade
     * @param releaseToSeller If true, refunds to seller; if false, releases to buyer
     * 
     * Requirements:
     * - Trade must exist
     * - Trade must be in DISPUTED state
     * - Only owner (admin) can call
     * 
     * State Changes:
     * - If releaseToSeller = false: Transitions to RELEASED, increments reputation
     * - If releaseToSeller = true: Transitions to CANCELLED (refund to seller)
     * - Transfers USDC to winner
     * 
     * Emits:
     * - DisputeResolved event
     * 
     * Security Notes:
     * - Only admin can resolve disputes
     * - Should be called after thorough investigation
     * - Consider implementing multisig or DAO governance for production
     * - nonReentrant modifier prevents reentrancy attacks
     */
    function resolveDispute(uint256 tradeId, bool releaseToSeller) 
        external 
        nonReentrant 
        onlyOwner 
        inState(tradeId, TradeState.DISPUTED) 
    {
        Trade storage trade = trades[tradeId];
        
        uint256 amount = trade.amount;
        address winner;
        
        if (releaseToSeller) {
            // Refund to seller (seller wins dispute)
            trade.state = TradeState.CANCELLED;
            winner = trade.seller;
            
            // No reputation increment for cancelled trades
            payable(trade.seller).transfer(amount);
        } else {
            // Release to buyer (buyer wins dispute)
            trade.state = TradeState.RELEASED;
            winner = trade.buyer;
            
            // Increment reputation for both parties (successful trade)
            completedTrades[trade.seller]++;
            completedTrades[trade.buyer]++;
            
            payable(trade.buyer).transfer(amount);
        }
        
        // Emit event
        emit DisputeResolved(tradeId, winner, amount, block.timestamp);
    }
}
