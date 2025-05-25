
// using pnpm 
// pnpm tsc to compile the typescript file
// pnpm vite --> package bundler to compile ts for me

/*
Commented code contains code to test on an anvil chain
Implemented to connect to my sepolia deployed smart contract 
*/

import {
    createWalletClient,
    createPublicClient,
    custom,
    defineChain,
    parseEther,
    formatEther,
    WalletClient,
    PublicClient,
    Chain,
    Address,
} from "viem";
import { sepolia } from "viem/chains";
import "viem/window"
import { 
    // ANVIL_ADDRESS,
    SEPOLIA_ADDRESS,
    ABI 
} from "./constants";
  
  const connectButton = document.getElementById("connectButton") as HTMLButtonElement;
  const getBalanceButton = document.getElementById("getBalanceButton") as HTMLButtonElement;
  const fundButton = document.getElementById("fundButton") as HTMLButtonElement;
  const ethAmountInput = document.getElementById("ethAmount") as HTMLInputElement;
  const withdrawButton = document.getElementById("withdrawButton") as HTMLButtonElement;
  const balanceDisplay = document.getElementById("balanceDisplay") as HTMLDivElement;
  const getContributorBalanceButton = document.getElementById("getContributorBalanceButton") as HTMLButtonElement;
  const contributorAddressInput = document.getElementById("contributorAddress") as HTMLInputElement;
  const contributorBalanceDisplay = document.getElementById("contributorBalanceDisplay") as HTMLDivElement;
  
  let walletClient: WalletClient;
  let publicClient: PublicClient;
  
  async function connect(): Promise<void> {
    console.log("Connecting to wallet...");
    if (typeof window.ethereum !== "undefined") {
      walletClient = createWalletClient({
        transport: custom(window.ethereum),
      });
      await walletClient.requestAddresses();
      connectButton.innerHTML = "Connected";
    } else {
      connectButton.innerHTML = "Please install MetaMask";
    }
  }
  
async function fund(): Promise<void> {
    if (typeof window.ethereum !== "undefined") {
        const ethAmount = ethAmountInput.value;
        console.log(`Funding with ${ethAmount} ETH...`);
  
        walletClient = createWalletClient({
            transport: custom(window.ethereum),
        });
  
        const [connectedAccount] = await walletClient.requestAddresses();
  
        publicClient = createPublicClient({
            transport: custom(window.ethereum),
        });
      
        const { request } = await publicClient.simulateContract({
            address: SEPOLIA_ADDRESS as Address,
            abi: ABI,
            functionName: "fund",
            account: connectedAccount,
            chain: sepolia,
            value: parseEther(ethAmount),
        });

        // const anvilChain = await getAnvilChain(publicClient);
        //   const { request } = await publicClient.simulateContract({
        //     address: ANVIL_ADDRESS as Address,
        //     abi: ABI,
        //     functionName: "fund",
        //     account: connectedAccount,
        //     chain: anvilChain,
        //     value: parseEther(ethAmount),
        //   });

        const hash = await walletClient.writeContract(request);
        console.log("Transaction hash:", hash);
    } else {
      connectButton.innerHTML = "Please install MetaMask";
    }
}
  
async function getBalance(): Promise<void> {
    if (typeof window.ethereum !== "undefined") {
        publicClient = createPublicClient({
            transport: custom(window.ethereum),
        });

        const balance = await publicClient.getBalance({
            address: SEPOLIA_ADDRESS as Address,
        });
    
        //   const balance = await publicClient.getBalance({
        //     address: ANVIL_ADDRESS,
        //   });
    
        balanceDisplay.innerHTML = `${formatEther(balance)} ETH`;
    } else {
        connectButton.innerHTML = "Please install MetaMask";
    }
}
  
async function withdraw(): Promise<void> {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...");
    
        walletClient = createWalletClient({
            transport: custom(window.ethereum),
        });
    
        const [connectedAccount] = await walletClient.requestAddresses();


        publicClient = createPublicClient({
            transport: custom(window.ethereum),
            chain: sepolia,
        });
    
        const { request } = await publicClient.simulateContract({
            address: SEPOLIA_ADDRESS as Address,
            abi: ABI,
            functionName: "withdraw",
            account: connectedAccount,
            chain: sepolia,
        });

        // const anvilChain = await getAnvilChain(publicClient);

        // publicClient = createPublicClient({
        //     transport: custom(window.ethereum),
        //     chain: anvilChain,
        // });
    
        // const { request } = await publicClient.simulateContract({
        //     address: ANVIL_ADDRESS as Address,
        //     abi: ABI,
        //     functionName: "withdraw",
        //     account: connectedAccount,
        //     chain: anvilChain,
        // });
    
        const hash = await walletClient.writeContract(request);
        console.log("Transaction hash:", hash);
    } else {
      connectButton.innerHTML = "Please install MetaMask";
    }
}

async function getContributorBalance(): Promise<void> {
    if (typeof window.ethereum !== "undefined") {
        const contributorAddress = contributorAddressInput.value;
        console.log(`Getting balance for ${contributorAddress}...`);
    
        publicClient = createPublicClient({
            transport: custom(window.ethereum),
        });
    
        try {
          const balance = await publicClient.readContract({
              address: SEPOLIA_ADDRESS as Address,
              abi: ABI,
              functionName: "getAddressToAmountFunded",
              args: [contributorAddress],
          }) as bigint;
          contributorBalanceDisplay.innerHTML = `${formatEther(balance)} ETH`;
        } catch (error) {
          contributorBalanceDisplay.innerHTML = "No balance found";
        }

        // const balance = await publicClient.readContract({
        //     address: ANVIL_ADDRESS as Address,
        //     abi: ABI,
        //     functionName: "getAddressToAmountFunded",
        //     args: [contributorAddress],
        // });
    
    } else {
      connectButton.innerHTML = "Please install MetaMask";
    }
}
  
  
  async function getAnvilChain(client: PublicClient): Promise<Chain> {
    const chainId = await client.getChainId();
    return defineChain({
      id: chainId,
      name: "Anvil Local",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ["http://localhost:8545"],
        },
      },
    });
  }
  

  connectButton.onclick = connect;
  fundButton.onclick = fund;
  getBalanceButton.onclick = getBalance;
  withdrawButton.onclick = withdraw;
  getContributorBalanceButton.onclick = getContributorBalance;