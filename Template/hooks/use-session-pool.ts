import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { FACTORY_ADDRESS, FACTORY_ABI, POOL_ABI } from '@/lib/contracts';

/**
 * Hook to create a new session pool
 */
export function useCreatePool() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createPool = async (sessionId: string, goalAmountInEth: string, durationInHours: number) => {
    try {
      const goalAmount = parseEther(goalAmountInEth);
      
      await writeContract({
        address: FACTORY_ADDRESS,
        abi: FACTORY_ABI,
        functionName: 'createPool',
        args: [sessionId, goalAmount, BigInt(durationInHours)],
      });
    } catch (err) {
      console.error('Error creating pool:', err);
      throw err;
    }
  };

  return {
    createPool,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to get pool address for a session
 */
export function useGetPoolAddress(sessionId: string) {
  const { data: poolAddress, isLoading, error } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'getPoolAddress',
    args: [sessionId],
  });

  return {
    poolAddress: poolAddress as `0x${string}` | undefined,
    isLoading,
    error,
  };
}

/**
 * Hook to get pool statistics
 */
export function usePoolStats(poolAddress: `0x${string}` | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'getPoolStats',
    query: {
      enabled: !!poolAddress && poolAddress !== '0x0000000000000000000000000000000000000000',
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  if (!data) {
    return {
      totalContributed: '0',
      goalAmount: '0',
      contributorCount: 0,
      goalReached: false,
      fundsReleased: false,
      cancelled: false,
      timeRemaining: 0,
      progress: 0,
      isLoading,
      error,
      refetch,
    };
  }

  const [totalContributed, goalAmount, contributorCount, goalReached, fundsReleased, cancelled, timeRemaining] = data as [
    bigint,
    bigint,
    bigint,
    boolean,
    boolean,
    boolean,
    bigint
  ];

  const progress = goalAmount > 0n ? Number((totalContributed * 100n) / goalAmount) : 0;

  return {
    totalContributed: formatEther(totalContributed),
    goalAmount: formatEther(goalAmount),
    contributorCount: Number(contributorCount),
    goalReached,
    fundsReleased,
    cancelled,
    timeRemaining: Number(timeRemaining),
    progress: Math.min(progress, 100),
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook to contribute to a pool
 */
export function useContribute(poolAddress: `0x${string}` | undefined) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const contribute = async (amountInEth: string) => {
    if (!poolAddress) {
      throw new Error('Pool address not provided');
    }

    try {
      const amount = parseEther(amountInEth);
      
      await writeContract({
        address: poolAddress,
        abi: POOL_ABI,
        functionName: 'contribute',
        value: amount,
      });
    } catch (err) {
      console.error('Error contributing to pool:', err);
      throw err;
    }
  };

  return {
    contribute,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to release funds (lecturer only)
 */
export function useReleaseFunds(poolAddress: `0x${string}` | undefined) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const releaseFunds = async () => {
    if (!poolAddress) {
      throw new Error('Pool address not provided');
    }

    try {
      await writeContract({
        address: poolAddress,
        abi: POOL_ABI,
        functionName: 'releaseFunds',
      });
    } catch (err) {
      console.error('Error releasing funds:', err);
      throw err;
    }
  };

  return {
    releaseFunds,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to cancel pool (lecturer only)
 */
export function useCancelPool(poolAddress: `0x${string}` | undefined) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const cancelPool = async () => {
    if (!poolAddress) {
      throw new Error('Pool address not provided');
    }

    try {
      await writeContract({
        address: poolAddress,
        abi: POOL_ABI,
        functionName: 'cancelPool',
      });
    } catch (err) {
      console.error('Error cancelling pool:', err);
      throw err;
    }
  };

  return {
    cancelPool,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to request refund
 */
export function useRequestRefund(poolAddress: `0x${string}` | undefined) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const requestRefund = async () => {
    if (!poolAddress) {
      throw new Error('Pool address not provided');
    }

    try {
      await writeContract({
        address: poolAddress,
        abi: POOL_ABI,
        functionName: 'requestRefund',
      });
    } catch (err) {
      console.error('Error requesting refund:', err);
      throw err;
    }
  };

  return {
    requestRefund,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

/**
 * Hook to get user's contribution
 */
export function useUserContribution(poolAddress: `0x${string}` | undefined, userAddress: `0x${string}` | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: poolAddress,
    abi: POOL_ABI,
    functionName: 'getContribution',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!poolAddress && !!userAddress && poolAddress !== '0x0000000000000000000000000000000000000000',
      refetchInterval: 5000,
    },
  });

  return {
    contribution: data ? formatEther(data as bigint) : '0',
    isLoading,
    error,
  };
}

