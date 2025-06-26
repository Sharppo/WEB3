let signer;
const nftStorageToken = "b8ec31ce.69d6260718cb4b67a7c3ba49d826c377"; // NFT.storage token kamu

async function connectWallet() {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    const address = await signer.getAddress();
    document.getElementById("walletAddress").innerText = "Wallet: " + address;
  } else {
    alert("Install MetaMask dulu!");
  }
}

document.getElementById("mintForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const name = document.getElementById("nftName").value;
  const description = document.getElementById("nftDesc").value;
  const imageFile = document.getElementById("nftImage").files[0];

  if (!name || !description || !imageFile || !signer) {
    alert("Isi semua kolom dan hubungkan wallet.");
    return;
  }

  // Upload gambar ke IPFS via NFT.storage
  const metadata = new FormData();
  metadata.append("file", imageFile);

  const response = await fetch("https://api.nft.storage/upload", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + nftStorageToken,
    },
    body: imageFile,
  });

  const result = await response.json();
  const ipfsURL = "ipfs://" + result.value.cid;

  // Kirim ke smart contract
  const contractAddress = "0xf8e81D47203A594245E36C48e151709F0C19fBe8";
  const abi = [
    "function safeMint(address to, string memory uri) public"
  ];
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const tx = await contract.safeMint(await signer.getAddress(), ipfsURL);
  document.getElementById("status").innerText = "Transaksi terkirim! Hash: " + tx.hash;
});
