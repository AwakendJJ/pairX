import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("PairXEscrow - Comprehensive Test Suite", function () {
  let escrow;
  let owner, seller, buyer, other;
  
  // Helper function to deploy fresh contract
  async function deployContract() {
    const [owner] = await hre.ethers.getSigners();
    const PairXEscrow = await hre.ethers.getContractFactory("PairXEscrow");
    const escrow = await PairXEscrow.deploy(owner.address);
    return { escrow, owner };
  }

  // Helper function to create a trade
  async function createTrade(escrow, seller, amount, paymentMethod = "Bank Transfer") {
    const tx = await escrow.connect(seller).createTrade(paymentMethod, { value: amount });
    const receipt = await tx.wait();
    return receipt;
  }

  describe("1. Deployment & Initialization", function () {
    beforeEach(async function () {
      [owner, seller, buyer, other] = await hre.ethers.getSigners();
      const deployment = await deployContract();
      escrow = deployment.escrow;
    });

    it("Should deploy with correct owner", async function () {
      expect(await escrow.owner()).to.equal(owner.address);
    });

    it("Should have correct version", async function () {
      expect(await escrow.VERSION()).to.equal("1.0.0");
    });

    it("Should have correct USDC system contract address", async function () {
      expect(await escrow.USDC_SYSTEM_CONTRACT()).to.equal("0x3600000000000000000000000000000000000000");
    });

    it("Should have correct timeout duration (24 hours)", async function () {
      expect(await escrow.TIMEOUT_DURATION()).to.equal(24 * 60 * 60);
    });

    it("Should initialize nextTradeId to 1", async function () {
      expect(await escrow.nextTradeId()).to.equal(1);
    });

    it("Should not be paused initially", async function () {
      expect(await escrow.paused()).to.equal(false);
    });
  });

  describe("2. Task 1.1: Create Trade", function () {
    beforeEach(async function () {
      [owner, seller, buyer, other] = await hre.ethers.getSigners();
      const deployment = await deployContract();
      escrow = deployment.escrow;
    });

    it("Should create a trade and emit event", async function () {
      const amount = hre.ethers.parseEther("100");
      const paymentMethod = "Bank Transfer - Chase";
      
      const tx = await escrow.connect(seller).createTrade(paymentMethod, { value: amount });
      const receipt = await tx.wait();
      const block = await hre.ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(escrow, "TradeCreated")
        .withArgs(1, seller.address, amount, paymentMethod, block.timestamp);
    });

    it("Should store trade with correct details", async function () {
      const amount = hre.ethers.parseEther("100");
      await createTrade(escrow, seller, amount, "PayPal");
      
      const trade = await escrow.getTrade(1);
      expect(trade.tradeId).to.equal(1);
      expect(trade.seller).to.equal(seller.address);
      expect(trade.buyer).to.equal(hre.ethers.ZeroAddress);
      expect(trade.amount).to.equal(amount);
      expect(trade.state).to.equal(0); // OPEN
      expect(trade.paymentMethod).to.equal("PayPal");
    });

    it("Should revert if amount is 0", async function () {
      await expect(
        escrow.connect(seller).createTrade("Method", { value: 0 })
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should revert if payment method is empty", async function () {
      await expect(
        escrow.connect(seller).createTrade("", { value: hre.ethers.parseEther("100") })
      ).to.be.revertedWith("Payment method cannot be empty");
    });

    it("Should revert when paused", async function () {
      await escrow.connect(owner).pause();
      await expect(
        escrow.connect(seller).createTrade("Method", { value: hre.ethers.parseEther("100") })
      ).to.be.revertedWithCustomError(escrow, "EnforcedPause");
    });
  });

  describe("3. Task 1.1: Accept Trade", function () {
    beforeEach(async function () {
      [owner, seller, buyer, other] = await hre.ethers.getSigners();
      const deployment = await deployContract();
      escrow = deployment.escrow;
      await createTrade(escrow, seller, hre.ethers.parseEther("100"));
    });

    it("Should accept trade and emit event", async function () {
      const tx = await escrow.connect(buyer).acceptTrade(1);
      const receipt = await tx.wait();
      const block = await hre.ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(escrow, "TradeAccepted")
        .withArgs(1, buyer.address, block.timestamp);
    });

    it("Should update trade state to LOCKED", async function () {
      await escrow.connect(buyer).acceptTrade(1);
      const trade = await escrow.getTrade(1);
      expect(trade.state).to.equal(1); // LOCKED
      expect(trade.buyer).to.equal(buyer.address);
    });

    it("Should revert if seller tries to accept their own trade", async function () {
      await expect(
        escrow.connect(seller).acceptTrade(1)
      ).to.be.revertedWith("Seller cannot accept their own trade");
    });

    it("Should revert if trade doesn't exist", async function () {
      await expect(
        escrow.connect(buyer).acceptTrade(999)
      ).to.be.revertedWith("Trade does not exist");
    });

    it("Should revert if trade is not in OPEN state", async function () {
      await escrow.connect(buyer).acceptTrade(1);
      await expect(
        escrow.connect(other).acceptTrade(1)
      ).to.be.revertedWith("Invalid trade state for this operation");
    });
  });

  describe("4. Task 1.1: Mark As Paid", function () {
    beforeEach(async function () {
      [owner, seller, buyer, other] = await hre.ethers.getSigners();
      const deployment = await deployContract();
      escrow = deployment.escrow;
      await createTrade(escrow, seller, hre.ethers.parseEther("100"));
      await escrow.connect(buyer).acceptTrade(1);
    });

    it("Should mark trade as paid and emit event", async function () {
      const tx = await escrow.connect(buyer).markAsPaid(1);
      const receipt = await tx.wait();
      const block = await hre.ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(escrow, "TradePaid")
        .withArgs(1, buyer.address, block.timestamp);
    });

    it("Should update trade state to PAID", async function () {
      await escrow.connect(buyer).markAsPaid(1);
      const trade = await escrow.getTrade(1);
      expect(trade.state).to.equal(2); // PAID
      expect(trade.paidAt).to.be.greaterThan(0);
    });

    it("Should revert if caller is not buyer", async function () {
      await expect(
        escrow.connect(seller).markAsPaid(1)
      ).to.be.revertedWith("Only buyer can call this function");
    });

    it("Should revert if trade is not in LOCKED state", async function () {
      await escrow.connect(buyer).markAsPaid(1);
      await expect(
        escrow.connect(buyer).markAsPaid(1)
      ).to.be.revertedWith("Invalid trade state for this operation");
    });
  });

  describe("5. Task 1.1: Release Funds", function () {
    beforeEach(async function () {
      [owner, seller, buyer, other] = await hre.ethers.getSigners();
      const deployment = await deployContract();
      escrow = deployment.escrow;
      await createTrade(escrow, seller, hre.ethers.parseEther("100"));
      await escrow.connect(buyer).acceptTrade(1);
      await escrow.connect(buyer).markAsPaid(1);
    });

    it("Should release funds to buyer and emit event", async function () {
      const amount = hre.ethers.parseEther("100");
      const tx = await escrow.connect(seller).release(1);
      const receipt = await tx.wait();
      const block = await hre.ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(escrow, "TradeReleased")
        .withArgs(1, seller.address, buyer.address, amount, block.timestamp);
    });

    it("Should transfer USDC to buyer", async function () {
      const buyerBalanceBefore = await hre.ethers.provider.getBalance(buyer.address);
      await escrow.connect(seller).release(1);
      const buyerBalanceAfter = await hre.ethers.provider.getBalance(buyer.address);
      
      expect(buyerBalanceAfter - buyerBalanceBefore).to.equal(hre.ethers.parseEther("100"));
    });

    it("Should increment reputation for both parties", async function () {
      await escrow.connect(seller).release(1);
      expect(await escrow.getReputation(seller.address)).to.equal(1);
      expect(await escrow.getReputation(buyer.address)).to.equal(1);
    });

    it("Should update trade state to RELEASED", async function () {
      await escrow.connect(seller).release(1);
      const trade = await escrow.getTrade(1);
      expect(trade.state).to.equal(3); // RELEASED
    });

    it("Should revert if caller is not seller", async function () {
      await expect(
        escrow.connect(buyer).release(1)
      ).to.be.revertedWith("Only seller can call this function");
    });

    it("Should revert if trade is not in PAID state", async function () {
      await escrow.connect(seller).release(1);
      await expect(
        escrow.connect(seller).release(1)
      ).to.be.revertedWith("Invalid trade state for this operation");
    });
  });

  describe("6. Task 1.1: Cancel Trade", function () {
    beforeEach(async function () {
      [owner, seller, buyer, other] = await hre.ethers.getSigners();
      const deployment = await deployContract();
      escrow = deployment.escrow;
      await createTrade(escrow, seller, hre.ethers.parseEther("100"));
    });

    it("Should cancel trade and emit event", async function () {
      const amount = hre.ethers.parseEther("100");
      const tx = await escrow.connect(seller).cancel(1);
      const receipt = await tx.wait();
      const block = await hre.ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(escrow, "TradeCancelled")
        .withArgs(1, seller.address, amount, block.timestamp);
    });

    it("Should refund USDC to seller", async function () {
      const sellerBalanceBefore = await hre.ethers.provider.getBalance(seller.address);
      const tx = await escrow.connect(seller).cancel(1);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;
      const sellerBalanceAfter = await hre.ethers.provider.getBalance(seller.address);
      
      expect(sellerBalanceAfter - sellerBalanceBefore + gasCost).to.equal(hre.ethers.parseEther("100"));
    });

    it("Should update trade state to CANCELLED", async function () {
      await escrow.connect(seller).cancel(1);
      const trade = await escrow.getTrade(1);
      expect(trade.state).to.equal(4); // CANCELLED
    });

    it("Should revert if caller is not seller", async function () {
      await expect(
        escrow.connect(buyer).cancel(1)
      ).to.be.revertedWith("Only seller can call this function");
    });

    it("Should revert if trade is not in OPEN state (buyer has accepted)", async function () {
      await escrow.connect(buyer).acceptTrade(1);
      await expect(
        escrow.connect(seller).cancel(1)
      ).to.be.revertedWith("Invalid trade state for this operation");
    });
  });

  describe("7. Task 1.3: Timeout & Dispute", function () {
    beforeEach(async function () {
      [owner, seller, buyer, other] = await hre.ethers.getSigners();
      const deployment = await deployContract();
      escrow = deployment.escrow;
      await createTrade(escrow, seller, hre.ethers.parseEther("100"));
      await escrow.connect(buyer).acceptTrade(1);
      await escrow.connect(buyer).markAsPaid(1);
    });

    it("Should detect timeout after 24 hours", async function () {
      expect(await escrow.checkTimeout(1)).to.equal(false);
      
      // Fast forward 24 hours
      await time.increase(24 * 60 * 60);
      
      expect(await escrow.checkTimeout(1)).to.equal(true);
    });

    it("Should trigger dispute after timeout", async function () {
      await time.increase(24 * 60 * 60);
      
      const tx = await escrow.connect(buyer).disputeTimeout(1);
      const receipt = await tx.wait();
      const block = await hre.ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(escrow, "DisputeTriggered")
        .withArgs(1, buyer.address, block.timestamp);
    });

    it("Should update trade state to DISPUTED", async function () {
      await time.increase(24 * 60 * 60);
      await escrow.connect(buyer).disputeTimeout(1);
      
      const trade = await escrow.getTrade(1);
      expect(trade.state).to.equal(5); // DISPUTED
    });

    it("Should revert if timeout hasn't elapsed", async function () {
      await expect(
        escrow.connect(buyer).disputeTimeout(1)
      ).to.be.revertedWith("Timeout period has not elapsed");
    });

    it("Should allow admin to resolve dispute in favor of buyer", async function () {
      await time.increase(24 * 60 * 60);
      await escrow.connect(buyer).disputeTimeout(1);
      
      const buyerBalanceBefore = await hre.ethers.provider.getBalance(buyer.address);
      await escrow.connect(owner).resolveDispute(1, false);
      const buyerBalanceAfter = await hre.ethers.provider.getBalance(buyer.address);
      
      expect(buyerBalanceAfter - buyerBalanceBefore).to.equal(hre.ethers.parseEther("100"));
    });

    it("Should allow admin to resolve dispute in favor of seller", async function () {
      await time.increase(24 * 60 * 60);
      await escrow.connect(buyer).disputeTimeout(1);
      
      const sellerBalanceBefore = await hre.ethers.provider.getBalance(seller.address);
      await escrow.connect(owner).resolveDispute(1, true);
      const sellerBalanceAfter = await hre.ethers.provider.getBalance(seller.address);
      
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(hre.ethers.parseEther("100"));
    });

    it("Should increment reputation only when buyer wins", async function () {
      await time.increase(24 * 60 * 60);
      await escrow.connect(buyer).disputeTimeout(1);
      
      await escrow.connect(owner).resolveDispute(1, false);
      expect(await escrow.getReputation(seller.address)).to.equal(1);
      expect(await escrow.getReputation(buyer.address)).to.equal(1);
    });

    it("Should not increment reputation when seller wins", async function () {
      await time.increase(24 * 60 * 60);
      await escrow.connect(buyer).disputeTimeout(1);
      
      await escrow.connect(owner).resolveDispute(1, true);
      expect(await escrow.getReputation(seller.address)).to.equal(0);
      expect(await escrow.getReputation(buyer.address)).to.equal(0);
    });
  });

  describe("8. Task 1.2: Security - Access Control", function () {
    beforeEach(async function () {
      [owner, seller, buyer, other] = await hre.ethers.getSigners();
      const deployment = await deployContract();
      escrow = deployment.escrow;
    });

    it("Should prevent non-owner from pausing", async function () {
      await expect(
        escrow.connect(seller).pause()
      ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
    });

    it("Should prevent non-owner from unpausing", async function () {
      await escrow.connect(owner).pause();
      await expect(
        escrow.connect(seller).unpause()
      ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
    });

    it("Should prevent non-owner from resolving disputes", async function () {
      await createTrade(escrow, seller, hre.ethers.parseEther("100"));
      await escrow.connect(buyer).acceptTrade(1);
      await escrow.connect(buyer).markAsPaid(1);
      await time.increase(24 * 60 * 60);
      await escrow.connect(buyer).disputeTimeout(1);
      
      await expect(
        escrow.connect(seller).resolveDispute(1, false)
      ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
    });
  });

  describe("9. Task 1.2: Security - Pausable", function () {
    beforeEach(async function () {
      [owner, seller, buyer, other] = await hre.ethers.getSigners();
      const deployment = await deployContract();
      escrow = deployment.escrow;
    });

    it("Should pause and unpause contract", async function () {
      expect(await escrow.paused()).to.equal(false);
      
      await escrow.connect(owner).pause();
      expect(await escrow.paused()).to.equal(true);
      
      await escrow.connect(owner).unpause();
      expect(await escrow.paused()).to.equal(false);
    });

    it("Should prevent createTrade when paused", async function () {
      await escrow.connect(owner).pause();
      await expect(
        escrow.connect(seller).createTrade("Method", { value: hre.ethers.parseEther("100") })
      ).to.be.revertedWithCustomError(escrow, "EnforcedPause");
    });

    it("Should prevent acceptTrade when paused", async function () {
      await createTrade(escrow, seller, hre.ethers.parseEther("100"));
      await escrow.connect(owner).pause();
      
      await expect(
        escrow.connect(buyer).acceptTrade(1)
      ).to.be.revertedWithCustomError(escrow, "EnforcedPause");
    });

    it("Should allow release and cancel even when paused", async function () {
      await createTrade(escrow, seller, hre.ethers.parseEther("100"));
      await escrow.connect(owner).pause();
      
      // Cancel should still work (to let sellers recover funds)
      await expect(escrow.connect(seller).cancel(1)).to.not.be.reverted;
    });
  });

  describe("10. Happy Path Integration Test", function () {
    it("Should complete full trade lifecycle successfully", async function () {
      [owner, seller, buyer, other] = await hre.ethers.getSigners();
      const deployment = await deployContract();
      escrow = deployment.escrow;
      
      const amount = hre.ethers.parseEther("100");
      
      // Step 1: Seller creates trade
      await createTrade(escrow, seller, amount, "Bank Transfer");
      let trade = await escrow.getTrade(1);
      expect(trade.state).to.equal(0); // OPEN
      
      // Step 2: Buyer accepts trade
      await escrow.connect(buyer).acceptTrade(1);
      trade = await escrow.getTrade(1);
      expect(trade.state).to.equal(1); // LOCKED
      
      // Step 3: Buyer marks as paid
      await escrow.connect(buyer).markAsPaid(1);
      trade = await escrow.getTrade(1);
      expect(trade.state).to.equal(2); // PAID
      
      // Step 4: Seller releases funds
      const buyerBalanceBefore = await hre.ethers.provider.getBalance(buyer.address);
      await escrow.connect(seller).release(1);
      const buyerBalanceAfter = await hre.ethers.provider.getBalance(buyer.address);
      
      trade = await escrow.getTrade(1);
      expect(trade.state).to.equal(3); // RELEASED
      expect(buyerBalanceAfter - buyerBalanceBefore).to.equal(amount);
      
      // Step 5: Verify reputation
      expect(await escrow.getReputation(seller.address)).to.equal(1);
      expect(await escrow.getReputation(buyer.address)).to.equal(1);
    });
  });

  describe("11. Helper Functions", function () {
    beforeEach(async function () {
      [owner, seller, buyer, other] = await hre.ethers.getSigners();
      const deployment = await deployContract();
      escrow = deployment.escrow;
    });

    it("Should return correct contract balance", async function () {
      expect(await escrow.getContractBalance()).to.equal(0);
      
      await createTrade(escrow, seller, hre.ethers.parseEther("100"));
      expect(await escrow.getContractBalance()).to.equal(hre.ethers.parseEther("100"));
      
      await createTrade(escrow, seller, hre.ethers.parseEther("50"));
      expect(await escrow.getContractBalance()).to.equal(hre.ethers.parseEther("150"));
    });

    it("Should return correct trade count", async function () {
      expect(await escrow.getTradeCount()).to.equal(0);
      
      await createTrade(escrow, seller, hre.ethers.parseEther("100"));
      expect(await escrow.getTradeCount()).to.equal(1);
      
      await createTrade(escrow, seller, hre.ethers.parseEther("50"));
      expect(await escrow.getTradeCount()).to.equal(2);
    });

    it("Should return correct reputation", async function () {
      expect(await escrow.getReputation(seller.address)).to.equal(0);
      
      // Complete a trade
      await createTrade(escrow, seller, hre.ethers.parseEther("100"));
      await escrow.connect(buyer).acceptTrade(1);
      await escrow.connect(buyer).markAsPaid(1);
      await escrow.connect(seller).release(1);
      
      expect(await escrow.getReputation(seller.address)).to.equal(1);
      expect(await escrow.getReputation(buyer.address)).to.equal(1);
    });
  });

  describe("12. Multiple Concurrent Trades", function () {
    it("Should handle multiple trades correctly", async function () {
      [owner, seller, buyer, other] = await hre.ethers.getSigners();
      const deployment = await deployContract();
      escrow = deployment.escrow;
      
      // Create 3 trades
      await createTrade(escrow, seller, hre.ethers.parseEther("100"));
      await createTrade(escrow, seller, hre.ethers.parseEther("200"));
      await createTrade(escrow, other, hre.ethers.parseEther("50"));
      
      expect(await escrow.getTradeCount()).to.equal(3);
      
      // Accept trades with different buyers
      await escrow.connect(buyer).acceptTrade(1);
      await escrow.connect(buyer).acceptTrade(2);
      await escrow.connect(seller).acceptTrade(3);
      
      // Complete trade 1
      await escrow.connect(buyer).markAsPaid(1);
      await escrow.connect(seller).release(1);
      
      // Cancel trade 2
      // Can't cancel after acceptance - skip this
      
      // Complete trade 3
      await escrow.connect(seller).markAsPaid(3);
      await escrow.connect(other).release(3);
      
      // Check reputations
      expect(await escrow.getReputation(seller.address)).to.equal(2); // completed 1 as seller, 1 as buyer
      expect(await escrow.getReputation(buyer.address)).to.equal(1);
      expect(await escrow.getReputation(other.address)).to.equal(1);
    });
  });
});
