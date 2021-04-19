import { useState ,useEffect} from "react";
import "./App.css";
import ReactLoading from "react-loading";
import Web3 from "web3";
import abi from "./contract/contract.json";
import getWeb3 from './getWeb3'
import ic_plus from './plus.svg'
const ipfsApi = require("ipfs-api");
const ipfs = ipfsApi({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});



function App() {
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState(null);
  const [tokenId, setTokenId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [account,setAccount] = useState(null)
  const [preview,setPreview] = useState(ic_plus)

  useEffect(() => {

    const check = async ()=>{
      if(window.ethereum){
        const web3 = new Web3(window.ethereum)
        const accounts = await web3.eth.getAccounts()
        if(accounts.length>0){
          setAccount(accounts[0])
        }
      }else{
        alert("请安装MetaMask插件")
      }
    }
    
    check()
    
  }, [])



  return (
    <div className="App">
      <div
        style={{
          height: "60px",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        <div style={{ flex: "1" }}></div>
        <div
          style={{
            border: "1px solid black",
            borderRadius: "10px",
            height: "30px",
            lineHeight: "30px",
            padding: "0 5px",
            cursor:'pointer'
          }}

          onClick={
            async ()=>{
              if(window.ethereum){
                const accounts = await window.ethereum.enable()

                setAccount(accounts)
              }
            }
          }
        >
          {account?account:'连接钱包'}
        </div>
      </div>
      <div style={{position:'relative',width:'80px',height:'80px',border:'1px solid black',margin:'0 auto',display:'table',marginTop:'50px'}}>
        <img src={preview} style={{position:"absolute",width:'100%',height:'100%',left:'0'}}/>
        <input
        style={{position:"absolute",width:'100%',height:'100%',left:'0px',top:'0px',opacity:'0'}}
          type="file"
          onChange={(e) => {
            const reader = new FileReader();
            const file = e.target.files[0];
            setFile(file);
            reader.readAsDataURL(file);
            reader.onloadend = () => {
              setPreview(reader.result)
            }
            
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop:'20px'
        }}
      >
        {loading ? (
          <ReactLoading type="spin" color="#000000" height="2%" width="2%" />
        ) : (
          <button
            onClick={async () => {
              setLoading(true);
              const reader = new FileReader();
              reader.readAsArrayBuffer(file);
              reader.onloadend = () => {
                ipfs.add(Buffer.from(reader.result)).then(async (res) => {
                  setHash(res[0].hash);
                  setLoading(false);
                  const web3 =  await getWeb3()
                  const nft = new web3.eth.Contract(
                    abi,
                    "0x550f4D9be310A84d4A048fe4e8130A935AB4c527"
                  );
                  const tokenId = web3.utils.keccak256(res[0].hash);
                  setTokenId(tokenId);
                  nft.methods
                    .mint(tokenId, res[0].hash)
                    .send({
                      from: account
                    });
                });
              };
            }}
          >
            commit
          </button>
        )}
      </div>
      <div>
        {hash ? <img src={"https://ipfs.infura.io/ipfs/" + hash} /> : null}
      </div>
      <div>
        {hash ? (
          <a href={"https://ipfs.infura.io/ipfs/" + hash}>
            {"https://ipfs.infura.io/ipfs/" + hash}
          </a>
        ) : null}
      </div>
      <div>{tokenId ? <p>{tokenId}</p> : null}</div>
    </div>
  );
}

export default App;
