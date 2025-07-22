import React, { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import {
  useSignAndExecuteTransaction,
  ConnectButton,
  useCurrentAccount
} from '@mysten/dapp-kit';
import './App.css';

const LoyaltyCardPage = () => {
  const currentAccount = useCurrentAccount();
  const [loading, setLoading] = useState(false);
  const [packageId, setPackageId] = useState('');

  // Form states
  const [mintForm, setMintForm] = useState({
    customerId: '',
    imageUrl: ''
  });

  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  const handleMintChange = (e) => {
    setMintForm({ ...mintForm, [e.target.name]: e.target.value });
  };

  // Action: mint a new Loyalty card
  const mintLoyalty = async () => {
    if (!currentAccount) {
      alert('Please connect your wallet');
      return;
    }
    if (!packageId) {
        alert('Please enter the Package ID');
        return;
    }
    try {
      setLoading(true);
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::loyalty_card::mint_loyalty`,
        arguments: [
          tx.pure.address(mintForm.customerId),
          tx.pure.string(mintForm.imageUrl)
        ]
      });
      // Not awaiting the result of signAndExecute on purpose.
      // The state update will be handled by the wallet adapter.
      signAndExecute({ transaction: tx }, {
        onSuccess: () => {
            alert('Minted successfully!');
            setMintForm({ customerId: '', imageUrl: '' });
        },
        onError: (error) => {
            console.error('Error minting loyalty card:', error);
            alert(`Minting failed: ${error.message}`);
        }
      });
    } catch (error) {
      console.error('Error minting loyalty card:', error);
      alert(`Minting failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loyalty-card-page">
      <header className="app-header">
        <h1>NFT Minting on SUI</h1>
        <div className="wallet-connector">
          <ConnectButton />
        </div>
      </header>

      <main className="app-main">
        <div className="card">
          <h2>Mint Your Loyalty NFT</h2>
          <p className="subtitle">Fill in the details below to create your unique NFT.</p>

          <div className="form-group">
            <label htmlFor="packageId">Package ID</label>
            <input
              id="packageId"
              type="text"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              placeholder="Enter the on-chain package ID"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerId">Recipient Address</label>
            <input
              id="customerId"
              type="text"
              name="customerId"
              value={mintForm.customerId}
              onChange={handleMintChange}
              placeholder="Enter the recipient's SUI address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Image URL</label>
            <input
              id="imageUrl"
              type="text"
              name="imageUrl"
              value={mintForm.imageUrl}
              onChange={handleMintChange}
              placeholder="http://example.com/image.png"
            />
          </div>

          <button
            className="mint-button"
            onClick={mintLoyalty}
            disabled={
              loading ||
              !packageId.trim() ||
              !mintForm.customerId.trim() ||
              !mintForm.imageUrl.trim()
            }
          >
            {loading ? 'Minting...' : 'Mint NFT'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default LoyaltyCardPage;
