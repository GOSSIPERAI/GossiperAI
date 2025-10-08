const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SessionPayment", function () {
  let sessionPayment;
  let owner;
  let creator;
  let contributor1;
  let contributor2;

  const SESSION_ID = "test-session-123";
  const GOAL_AMOUNT = ethers.parseEther("1.0"); // 1 ETH

  beforeEach(async function () {
    [owner, creator, contributor1, contributor2] = await ethers.getSigners();

    const SessionPayment = await ethers.getContractFactory("SessionPayment");
    sessionPayment = await SessionPayment.deploy();
    await sessionPayment.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await sessionPayment.owner()).to.equal(owner.address);
    });

    it("Should set platform fee to 2%", async function () {
      expect(await sessionPayment.platformFeePercent()).to.equal(2);
    });
  });

  describe("Session Creation", function () {
    it("Should create a new session", async function () {
      await expect(
        sessionPayment.connect(creator).createSession(SESSION_ID, GOAL_AMOUNT)
      )
        .to.emit(sessionPayment, "SessionCreated")
        .withArgs(SESSION_ID, creator.address, GOAL_AMOUNT, await time.latest());

      const session = await sessionPayment.getSession(SESSION_ID);
      expect(session.creator).to.equal(creator.address);
      expect(session.goalAmount).to.equal(GOAL_AMOUNT);
      expect(session.isActive).to.equal(true);
    });

    it("Should fail to create duplicate session", async function () {
      await sessionPayment.connect(creator).createSession(SESSION_ID, GOAL_AMOUNT);
      
      await expect(
        sessionPayment.connect(creator).createSession(SESSION_ID, GOAL_AMOUNT)
      ).to.be.revertedWith("Session already exists");
    });

    it("Should fail with zero goal amount", async function () {
      await expect(
        sessionPayment.connect(creator).createSession(SESSION_ID, 0)
      ).to.be.revertedWith("Goal amount must be greater than 0");
    });
  });

  describe("Contributions", function () {
    beforeEach(async function () {
      await sessionPayment.connect(creator).createSession(SESSION_ID, GOAL_AMOUNT);
    });

    it("Should accept contributions", async function () {
      const contributionAmount = ethers.parseEther("0.1");
      
      await expect(
        sessionPayment.connect(contributor1).contribute(SESSION_ID, {
          value: contributionAmount
        })
      ).to.emit(sessionPayment, "ContributionMade");

      const session = await sessionPayment.getSession(SESSION_ID);
      expect(session.contributionCount).to.equal(1);
      
      // Check that platform fee was deducted (2%)
      const expectedAmount = contributionAmount * 98n / 100n;
      expect(session.currentAmount).to.equal(expectedAmount);
    });

    it("Should track multiple contributions", async function () {
      const amount1 = ethers.parseEther("0.1");
      const amount2 = ethers.parseEther("0.2");

      await sessionPayment.connect(contributor1).contribute(SESSION_ID, {
        value: amount1
      });

      await sessionPayment.connect(contributor2).contribute(SESSION_ID, {
        value: amount2
      });

      const session = await sessionPayment.getSession(SESSION_ID);
      expect(session.contributionCount).to.equal(2);
    });

    it("Should track user contributions", async function () {
      const contributionAmount = ethers.parseEther("0.1");
      
      await sessionPayment.connect(contributor1).contribute(SESSION_ID, {
        value: contributionAmount
      });

      const userContribution = await sessionPayment.getUserContribution(
        SESSION_ID,
        contributor1.address
      );
      
      const expectedAmount = contributionAmount * 98n / 100n;
      expect(userContribution).to.equal(expectedAmount);
    });

    it("Should fail with zero contribution", async function () {
      await expect(
        sessionPayment.connect(contributor1).contribute(SESSION_ID, {
          value: 0
        })
      ).to.be.revertedWith("Contribution must be greater than 0");
    });

    it("Should fail for non-existent session", async function () {
      await expect(
        sessionPayment.connect(contributor1).contribute("non-existent", {
          value: ethers.parseEther("0.1")
        })
      ).to.be.revertedWith("Session does not exist");
    });
  });

  describe("Session Closure", function () {
    beforeEach(async function () {
      await sessionPayment.connect(creator).createSession(SESSION_ID, GOAL_AMOUNT);
      await sessionPayment.connect(contributor1).contribute(SESSION_ID, {
        value: ethers.parseEther("0.5")
      });
    });

    it("Should allow creator to close session", async function () {
      await expect(
        sessionPayment.connect(creator).closeSession(SESSION_ID)
      ).to.emit(sessionPayment, "SessionClosed");

      const session = await sessionPayment.getSession(SESSION_ID);
      expect(session.isActive).to.equal(false);
    });

    it("Should fail if non-creator tries to close", async function () {
      await expect(
        sessionPayment.connect(contributor1).closeSession(SESSION_ID)
      ).to.be.revertedWith("Only session creator can close");
    });

    it("Should prevent contributions after closure", async function () {
      await sessionPayment.connect(creator).closeSession(SESSION_ID);

      await expect(
        sessionPayment.connect(contributor1).contribute(SESSION_ID, {
          value: ethers.parseEther("0.1")
        })
      ).to.be.revertedWith("Session is not active");
    });
  });

  describe("Fund Withdrawal", function () {
    beforeEach(async function () {
      await sessionPayment.connect(creator).createSession(SESSION_ID, GOAL_AMOUNT);
      await sessionPayment.connect(contributor1).contribute(SESSION_ID, {
        value: ethers.parseEther("0.5")
      });
      await sessionPayment.connect(creator).closeSession(SESSION_ID);
    });

    it("Should allow creator to withdraw funds", async function () {
      const initialBalance = await ethers.provider.getBalance(creator.address);
      
      const tx = await sessionPayment.connect(creator).withdrawFunds(SESSION_ID);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(creator.address);
      const session = await sessionPayment.getSession(SESSION_ID);

      expect(session.fundsWithdrawn).to.equal(true);
      expect(session.currentAmount).to.equal(0);
    });

    it("Should fail if non-creator tries to withdraw", async function () {
      await expect(
        sessionPayment.connect(contributor1).withdrawFunds(SESSION_ID)
      ).to.be.revertedWith("Only session creator can withdraw");
    });

    it("Should fail if session is still active", async function () {
      await sessionPayment.connect(creator).createSession("active-session", GOAL_AMOUNT);
      await sessionPayment.connect(contributor1).contribute("active-session", {
        value: ethers.parseEther("0.1")
      });

      await expect(
        sessionPayment.connect(creator).withdrawFunds("active-session")
      ).to.be.revertedWith("Session must be closed first");
    });

    it("Should fail on double withdrawal", async function () {
      await sessionPayment.connect(creator).withdrawFunds(SESSION_ID);

      await expect(
        sessionPayment.connect(creator).withdrawFunds(SESSION_ID)
      ).to.be.revertedWith("Funds already withdrawn");
    });
  });

  describe("Platform Fees", function () {
    beforeEach(async function () {
      await sessionPayment.connect(creator).createSession(SESSION_ID, GOAL_AMOUNT);
    });

    it("Should collect platform fees", async function () {
      const contributionAmount = ethers.parseEther("1.0");
      
      await sessionPayment.connect(contributor1).contribute(SESSION_ID, {
        value: contributionAmount
      });

      const expectedFee = contributionAmount * 2n / 100n;
      expect(await sessionPayment.totalPlatformFees()).to.equal(expectedFee);
    });

    it("Should allow owner to withdraw platform fees", async function () {
      await sessionPayment.connect(contributor1).contribute(SESSION_ID, {
        value: ethers.parseEther("1.0")
      });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      const tx = await sessionPayment.connect(owner).withdrawPlatformFees();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(await sessionPayment.totalPlatformFees()).to.equal(0);
    });

    it("Should allow owner to update platform fee", async function () {
      await sessionPayment.connect(owner).updatePlatformFee(5);
      expect(await sessionPayment.platformFeePercent()).to.equal(5);
    });

    it("Should fail if fee exceeds 10%", async function () {
      await expect(
        sessionPayment.connect(owner).updatePlatformFee(11)
      ).to.be.revertedWith("Fee cannot exceed 10%");
    });

    it("Should fail if non-owner tries to update fee", async function () {
      await expect(
        sessionPayment.connect(contributor1).updatePlatformFee(5)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await sessionPayment.connect(creator).createSession(SESSION_ID, GOAL_AMOUNT);
      await sessionPayment.connect(contributor1).contribute(SESSION_ID, {
        value: ethers.parseEther("0.1")
      });
      await sessionPayment.connect(contributor2).contribute(SESSION_ID, {
        value: ethers.parseEther("0.2")
      });
    });

    it("Should return session contributions", async function () {
      const contributions = await sessionPayment.getSessionContributions(SESSION_ID);
      expect(contributions.length).to.equal(2);
      expect(contributions[0].contributor).to.equal(contributor1.address);
      expect(contributions[1].contributor).to.equal(contributor2.address);
    });

    it("Should return contract balance", async function () {
      const balance = await sessionPayment.getContractBalance();
      expect(balance).to.be.gt(0);
    });
  });
});
