import { Wallet } from 'ethers'
import { ethers } from 'hardhat'
import { expect } from 'chai'
import {
  SimpleAccount,
  EntryPoint,
  VerifyingPaymaster,
  VerifyingPaymaster__factory,
  EntryPoint__factory
} from '../typechain-types'
import {
  createAccount,
  createAccountOwner, createAddress,
   simulationResultCatch
} from './testutils'
import { fillAndSign, getUserOpHash } from './UserOp'
import { arrayify, defaultAbiCoder, hexConcat, hexlify, parseEther } from 'ethers/lib/utils'
import { UserOperation } from './UserOperation'

const MOCK_VALID_UNTIL = '0x00000000deadbeef'
const MOCK_VALID_AFTER = '0x0000000000001234'
const MOCK_SIG = '0x1234'

describe('EntryPoint with VerifyingPaymaster', function () {
  let entryPoint: EntryPoint
  let accountOwner: Wallet
  // const ethersSigner = ethers.provider.getSigner()
  // let account: SimpleAccount
  let offchainSigner: Wallet
const senderAddress = '0xF379F263682CD387e3b9022cB3CBd8610aF6B051'
  let paymaster: VerifyingPaymaster
  before(async function () {
    this.timeout(20000)
    

    
    // accountOwner = createAccountOwner()
    
    const [deployerWallet] = await ethers.getSigners();
    accountOwner = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY_2!)
    offchainSigner = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY!)
    console.log(accountOwner.address)
    console.log(offchainSigner.address)
    entryPoint = EntryPoint__factory.connect("0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",deployerWallet)
    console.log(`Verifying Paymaster Signer : ${deployerWallet.address}`)
    const VerifyingPaymasterArtifacts = await ethers.getContractFactory("VerifyingPaymaster", deployerWallet);
    // paymaster = VerifyingPaymasterArtifacts.deploy(entryPoint.address,accountOwner.address)
    paymaster = VerifyingPaymasterArtifacts.attach('0xd6F6bA8025366300822Dae5008762074bC72F1B5') as unknown as VerifyingPaymaster
    console.log(`Verfiying Paymaster Address: ${await paymaster.address}`)

  //   const userOperation = {
  //     sender: '0xF379F263682CD387e3b9022cB3CBd8610aF6B051',
  //     nonce: hexlify(1),
  //     initCode:"0x",
  //     callData:'',
  //     callGasLimit: ethers.utils.hexlify(100_000), // hardcode it for now at a high value
  //     verificationGasLimit: ethers.utils.hexlify(400_000), // hardcode it for now at a high value
  //     preVerificationGas: ethers.utils.hexlify(50_000), // hardcode it for now at a high value
  //     maxFeePerGas: ethers.utils.hexlify(gasPrice),
  //     maxPriorityFeePerGas: ethers.utils.hexlify(gasPrice),
  //     paymasterAndData: "0x",
  //     signature: "0x"
  // }
    
    // const verifyingPaymaster = VerifyingPaymasterArtifacts.attach('0xd6F6bA8025366300822Dae5008762074bC72F1B5') as VerifyingPaymaster
    // paymaster = await VerifyingPaymaster__factory.connect("0xd6F6bA8025366300822Dae5008762074bC72F1B5") //.deploy(entryPoint.address, offchainSigner.address)
    // await paymaster.addStake(1, { value: parseEther('2') })
    // await entryPoint.depositTo(paymaster.address, { value: parseEther('1') });
    // ({ proxy: account } = await createAccount(ethersSigner, accountOwner.address, entryPoint.address))
  })

  describe('#parsePaymasterAndData', () => {
    it('should parse data properly', async () => {
      const paymasterAndData = hexConcat([await paymaster.address, defaultAbiCoder.encode(['uint48', 'uint48'], [MOCK_VALID_UNTIL, MOCK_VALID_AFTER]), MOCK_SIG])
      console.log("PaymasterData:"+paymasterAndData)

      const res = await paymaster.parsePaymasterAndData(paymasterAndData)
      expect(res.validUntil).to.be.equal(ethers.BigNumber.from(MOCK_VALID_UNTIL))
      expect(res.validAfter).to.be.equal(ethers.BigNumber.from(MOCK_VALID_AFTER))
      expect(res.signature).equal(MOCK_SIG)
    })
  })

  describe('#validatePaymasterUserOp', () => {
    it('should reject on no signature', async () => {
      const userOp = await fillAndSign({
        sender: senderAddress,
        paymasterAndData: hexConcat([paymaster.address, defaultAbiCoder.encode(['uint48', 'uint48'], [MOCK_VALID_UNTIL, MOCK_VALID_AFTER]), '0x1234'])
      }, accountOwner, entryPoint)
      await expect(entryPoint.callStatic.simulateValidation(userOp)).to.be.revertedWith('invalid signature length in paymasterAndData')
    })

    it('should reject on invalid signature', async () => {
      const userOp = await fillAndSign({
        sender: senderAddress,
        paymasterAndData: hexConcat([paymaster.address, defaultAbiCoder.encode(['uint48', 'uint48'], [MOCK_VALID_UNTIL, MOCK_VALID_AFTER]), '0x' + '00'.repeat(65)])
      }, accountOwner, entryPoint)
      await expect(entryPoint.callStatic.simulateValidation(userOp)).to.be.revertedWith('ECDSA: invalid signature')
    })
    it('succeed with valid signature', async () => {
      const userOp1 = await fillAndSign({
        sender: senderAddress,
        paymasterAndData: hexConcat([paymaster.address, defaultAbiCoder.encode(['uint48', 'uint48'], [MOCK_VALID_UNTIL, MOCK_VALID_AFTER]), '0x' + '00'.repeat(65)])
      }, accountOwner, entryPoint)
      const hash = await paymaster.getHash(userOp1, MOCK_VALID_UNTIL, MOCK_VALID_AFTER)
      const sig = await offchainSigner.signMessage(arrayify(hash))
      const userOp = await fillAndSign({
        ...userOp1,
        paymasterAndData: hexConcat([paymaster.address, defaultAbiCoder.encode(['uint48', 'uint48'], [MOCK_VALID_UNTIL, MOCK_VALID_AFTER]), sig])
      }, accountOwner, entryPoint)
      const res = await entryPoint.callStatic.simulateValidation(userOp).catch(simulationResultCatch => simulationResultCatch)
      expect(res.errorArgs.returnInfo.sigFailed).to.be.false
      expect(res.errorArgs.returnInfo.validAfter).to.be.equal(ethers.BigNumber.from(MOCK_VALID_AFTER))
      expect(res.errorArgs.returnInfo.validUntil).to.be.equal(ethers.BigNumber.from(MOCK_VALID_UNTIL))
    })

    // it('succeed with valid signature with Inputs', async () => {
      
    //   const userOp = {
    //     "sender": "0xF379F263682CD387e3b9022cB3CBd8610aF6B051",
    //     "nonce": "0x03",
    //     "initCode": "0x",
    //     "callData": "0xb61d27f6000000000000000000000000ea68b3efbbf63bb837f36a90aa97df27bbf9b864000000000000000000000000000000000000000000000000006a94d74f430000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000043a4b66f100000000000000000000000000000000000000000000000000000000",
    //     "callGasLimit": "0x0186a0",
    //     "verificationGasLimit": "0x061a80",
    //     "preVerificationGas": "0xc350",
    //     "maxFeePerGas": "0x17bdea70f1",
    //     "maxPriorityFeePerGas": "0x17bdea70f1",
    //     "paymasterAndData": "0xd6f6ba8025366300822dae5008762074bc72f1b50000000000000000000000000000000000000000000000000000000064c3b7ee00000000000000000000000000000000000000000000000000000000000000007123e919038d7afc5030cedfa226298309632251d19ffa58699720dd350071fc68ab39f0b6cd6e4e922c3e8705ae74655e8b5bfec8db1971543f142afb0d480c1b",
    //     "signature": "0x"
    //   }

    //   const userOpHash = await entryPoint.getUserOpHash(userOp)
    //   const signature = await accountOwner.signMessage(userOpHash)
    //   userOp.signature = signature
    //   console.log(userOpHash)
    //   console.log(getUserOpHash(userOp, entryPoint!.address, 59140))
    //   const maxCost = parseEther('0')
    //   const overrides = {
    //     from: entryPoint.address,
    //   };
    //   const provider = new ethers.providers.JsonRpcProvider(`https://rpc.goerli.linea.build`)
    //   const VerifyingPaymasterArtifacts2 = await ethers.getContractFactory("VerifyingPaymaster",overrides);
    //   const testPaymaster = VerifyingPaymasterArtifacts2.attach('0xd6F6bA8025366300822Dae5008762074bC72F1B5') as VerifyingPaymaster
    //  console.log(testPaymaster)
    //   const res = await testPaymaster.callStatic.validatePaymasterUserOp(userOp,userOpHash,maxCost,overrides).catch(simulationResultCatch => simulationResultCatch)
    //   console.log(res)
    //   expect(res.errorArgs.returnInfo.sigFailed).to.be.false
    //   expect(res.errorArgs.returnInfo.validAfter).to.be.equal(ethers.BigNumber.from(MOCK_VALID_AFTER))
    //   expect(res.errorArgs.returnInfo.validUntil).to.be.equal(ethers.BigNumber.from(MOCK_VALID_UNTIL))
    // })
    describe('with wrong signature', () => {
      let wrongSigUserOp: UserOperation
      const beneficiaryAddress = new ethers.Wallet(process.env.ETHEREUM_PRIVATE_KEY!).address //createAddress()
      before(async () => {
        const sig = await offchainSigner.signMessage(arrayify('0xdead'))
        wrongSigUserOp = await fillAndSign({
          sender: senderAddress,
          paymasterAndData: hexConcat([paymaster.address, defaultAbiCoder.encode(['uint48', 'uint48'], [MOCK_VALID_UNTIL, MOCK_VALID_AFTER]), sig])
        }, accountOwner, entryPoint)
      })

      it('should return signature error (no revert) on wrong signer signature', async () => {
        const ret = await entryPoint.callStatic.simulateValidation(wrongSigUserOp).catch(simulationResultCatch => simulationResultCatch)
        expect(ret.errorArgs.returnInfo.sigFailed).to.be.true
      })

      // it('handleOp revert on signature failure in handleOps', async () => {
      //   // await entryPoint.estimateGas.handleOps([wrongSigUserOp], beneficiaryAddress).catch(e => console.log(e)) // await expect()
      //   await expect(entryPoint.estimateGas.handleOps([wrongSigUserOp], beneficiaryAddress)).to.revertedWith('AA34 signature error')
      // })
    })

    
  })
})