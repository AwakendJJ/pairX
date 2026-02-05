import { TradeActionsDemo } from '@/components/TradeActionsDemo';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export default function TestActionsPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Trade Actions Test</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Test all contract interactions with real transactions
              </p>
            </div>
            <ConnectButton />
          </div>
        </div>

        {/* Demo Component */}
        <TradeActionsDemo />

        {/* Footer */}
        <div className="mt-8 p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Contract Details</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <strong>Address:</strong> 0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <strong>Network:</strong> Arc L1 Testnet (Chain ID: 5042002)
          </p>
          <a
            href="https://testnet.arcscan.app/address/0xf4436E192e01ADBa7d42c3c761C0B765EC9366E7"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm underline"
          >
            View Contract on Explorer →
          </a>
        </div>
      </div>
    </main>
  );
}
