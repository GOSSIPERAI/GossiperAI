// Contract addresses (will be updated after deployment)
export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}` || '0x';

// Import ABIs from artifacts
import SessionPoolFactoryABI from '../artifacts/contracts/SessionPoolFactory.sol/SessionPoolFactory.json';
import SessionPoolABI from '../artifacts/contracts/SessionPool.sol/SessionPool.json';

export const FACTORY_ABI = SessionPoolFactoryABI.abi;
export const POOL_ABI = SessionPoolABI.abi;

// Base Sepolia chain ID
export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_CHAIN_ID = 8453;

