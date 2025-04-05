export const data = [
  {
    id: 1,
    quest: "Install Git",
    description: "Install Git on your computer so you can use it to download all files needed for sp1",
    instructions: [
        "Type in your terminal: sudo apt install git-all",
    ],
    question: "What output do you get when you type 'git --version' in your terminal?"
  },
  {
    id: 2,
    quest: "Install Rust",
    description: "Install Rust programming language using rustup (Recommended method)",
    instructions: [
      "Run the following command in your terminal:",
      "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh",
      "Follow the on-screen instructions",
      "After installation, restart your terminal or run: source $HOME/.cargo/env"
    ],
    question: "What output do you get when you type 'rustc --version' in your terminal?"
  },
  {
    id: 3,
    quest: "Install Docker",
    description: "Install Docker container platform on your system (Linux or macOS)",
    instructions: [
      "For Linux (Ubuntu/Debian):",
      "1. Update package list: sudo apt update",
      "2. Install prerequisites: sudo apt install -y apt-transport-https ca-certificates curl software-properties-common",
      "3. Add Docker's GPG key: curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg",
      "4. Add Docker repository: echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable' | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null",
      "5. Install Docker: sudo apt install -y docker-ce docker-ce-cli containerd.io",
      "6. Add user to docker group: sudo usermod -aG docker $USER",
      "",
      "For macOS:",
      "1. Download Docker Desktop from https://www.docker.com/products/docker-desktop",
      "2. Open the downloaded .dmg file",
      "3. Drag Docker.app to Applications folder",
      "4. Open Docker Desktop from Applications",
      "5. Follow the installation prompts",
      "",
      "After installation:",
      "- Log out and log back in (Linux) or restart Docker Desktop (macOS)",
      "- Verify installation by running: docker --version"
    ],
    question: "What output do you get when you type 'docker --version' in your terminal?"
  },
  {
    id: 4,
    quest: "Install SP1",
    description: "Install SP1 toolchain and cargo prove CLI (Recommended method)",
    instructions: [
      "Run this single command to install everything:",
      "curl -L https://sp1up.succinct.xyz | bash && sp1up",
      "",
      "This will:",
      "1. Install sp1up",
      "2. Make sp1up available in your CLI",
      "3. Install the succinct Rust toolchain",
      "4. Install the cargo prove CLI tool",
      "",
      "After installation, verify by running:",
      "cargo prove --version"
    ],
    question: "What output do you get when you type 'cargo prove --version' in your terminal?"
  },
  {
    id: 5,
    quest: "Download the example of core proof",
    description: "Clone and run the example of core proof to generate your first SP1 proof",
    instructions: [
      "1. Clone the repository:",
      "git clone https://github.com/Shershulia/example-of-core-proof.git",
      "",
      "The repository contains three main directories:",
      "- program/: Contains the core program implementation",
      "- script/: Contains the proof generation script",
      "- lib/: Contains shared library code",
      "",
      "2. Run command tail -n 1 README.md",
    ],
    question: "What do you get in the terminal when you run command tail -n 1 README.md?"
  },
  {
    id: 6,
    quest: "Generate SP1 Proof with Script",
    description: "Navigate to script directory and generate SP1 proof for N=11",
    instructions: [
      "1. Navigate to the script directory:",
      "cd example-of-core-proof/script",
      "",
      "2. Generate SP1 proof for n=11:",
      "cargo run --bin prove --release -- --prove --n 11",
      "",
      "This will generate a proof for the program that calculates N squared",
      "The output will show you:",
      "- The input value N",
      "- The calculated N squared value",
      "- The program verification key",
      "- The location of the saved proof file"
    ],
    questions: [
      {
        text: "What is the final value of N squared (N²) from the output?"
      },
      {
        text: "What is the Program VKey from the output?"
      },
      {
        text: "In which file is the proof saved?"
      }
    ]
  },
  {
    id: 7,
    quest: "Verify SP1 Proof",
    description: "Verify the generated SP1 proof using the verification command",
    instructions: [
      "1. Make sure you're in the script directory:",
      "cd example-of-core-proof/script",
      "",
      "2. Verify the proof using the following command:",
      "cargo run --bin prove --release -- --verify --proof-path example_program_proof.bin",
      "",
      "This will verify the proof we generated in the previous quest",
      "The output will show you:",
      "- The input value N",
      "- The calculated N squared value",
      "- The verification result"
    ],
    question: "What is the verification result message (last string)?"
  }
];
