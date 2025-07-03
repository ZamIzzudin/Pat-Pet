# Pat-Pet NFT Game

A Next.js + Phaser game with Web3/NFT integration using Wagmi.

## Features

- **Phaser Game Engine**: Interactive pet care game with multiple screens
- **Web3 Integration**: Connect wallets and manage NFT pets
- **Bidirectional Communication**: React components can trigger game events and vice versa
- **NFT Support**: Mint, trade, and manage pet NFTs
- **Real-time Sync**: Game state synchronized with blockchain data

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. A Web3 wallet (MetaMask, WalletConnect, etc.)
3. WalletConnect Project ID (get from [WalletConnect Cloud](https://cloud.walletconnect.com/))

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Update `.env.local` with your configuration:
   - `NEXT_PUBLIC_WC_PROJECT_ID`: Your WalletConnect project ID
   - `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`: Your NFT contract address
   - Other RPC URLs as needed

5. Run the development server:
   ```bash
   npm run dev
   ```

## Architecture

### Game-React Communication

The project uses an event bus system (`gameEventBus`) for bidirectional communication:

**React → Game:**
- Trigger pet actions from React UI
- Update game state from wallet/NFT events
- Sync blockchain data with game

**Game → React:**
- Update React UI when game state changes
- Emit events for NFT minting opportunities
- Sync pet stats with external systems

### Key Components

1. **GameState**: Central state management with event emission
2. **GameEventBus**: Communication layer between React and Phaser
3. **WalletProvider**: Wagmi configuration and wallet management
4. **NFTManager**: NFT operations and game integration

### Event Types

- `STATS_UPDATED`: Pet stats changed
- `INVENTORY_UPDATED`: Items added/removed
- `NFT_MINTED`: New NFT created
- `NFT_EQUIPPED`: NFT pet equipped
- `WALLET_CONNECTED/DISCONNECTED`: Wallet state changes
- `FEED_PET`, `PLAY_WITH_PET`, `HATCH_EGG`: Pet actions

## Usage

### In-Game Controls

- **Arrow Keys**: Move character
- **Space**: Interact with doors/objects
- **P**: Open pet screen
- **B**: Open backpack
- **G**: Open goals
- **ESC**: Return to previous screen

### Web3 Features

1. **Connect Wallet**: Use the Web3 panel or NFT page
2. **Mint NFTs**: Create permanent records of your pet's progress
3. **Sync Stats**: Pet stats automatically sync between game and blockchain
4. **External Control**: Use React UI to trigger game actions

### Development

The game supports hot reloading for both React components and Phaser scenes. The event bus ensures real-time communication between all parts of the application.

## Smart Contract Integration

To fully integrate with your NFT contract:

1. Update `src/lib/wagmi.ts` with your preferred chains
2. Replace the ABI in `src/components/web3/NFTManager.tsx`
3. Set your contract address in environment variables
4. Implement additional contract functions as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both game and Web3 functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.