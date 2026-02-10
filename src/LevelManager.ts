/**
 * Level Manager - Manages game areas and navigation
 */
export class LevelManager {
  // Map/Area order list
  static readonly LEVEL_ORDER: string[] = [
    "SatoshiTownScene",
    "EthereumForestScene",
    "SolanaCavesScene",
    "PumpBeachScene",
    "NFTCityScene",
    "RugPullTowerScene",
    "DiamondHandsDojoScene",
    "BlockchainPlateauScene"
  ];

  // Get the key of the next level scene
  static getNextLevelScene(currentSceneKey: string): string | null {
    const currentIndex = LevelManager.LEVEL_ORDER.indexOf(currentSceneKey);

    // If it's the last level or current level not found, return null
    if (currentIndex === -1 || currentIndex >= LevelManager.LEVEL_ORDER.length - 1) {
      return null;
    }

    return LevelManager.LEVEL_ORDER[currentIndex + 1];
  }

  // Check if it's the last level
  static isLastLevel(currentSceneKey: string): boolean {
    const currentIndex = LevelManager.LEVEL_ORDER.indexOf(currentSceneKey);
    return currentIndex === LevelManager.LEVEL_ORDER.length - 1;
  }

  // Get the key of the first level scene
  static getFirstLevelScene(): string | null {
    return LevelManager.LEVEL_ORDER.length > 0 ? LevelManager.LEVEL_ORDER[0] : null;
  }

  // Get map info
  static getMapInfo(mapKey: string): { name: string; description: string } {
    const maps: Record<string, { name: string; description: string }> = {
      "SatoshiTownScene": {
        name: "Satoshi Town",
        description: "Starting village, Professor Vitalik's Lab"
      },
      "EthereumForestScene": {
        name: "Ethereum Forest",
        description: "Dense forest with Bug and Poison types"
      },
      "SolanaCavesScene": {
        name: "Solana Caves",
        description: "Underground caves with Rock and Ground types"
      },
      "PumpBeachScene": {
        name: "Pump Beach",
        description: "Coastal area with Water types and a shop"
      },
      "NFTCityScene": {
        name: "NFT City",
        description: "Main hub with PvP Arena and shops"
      },
      "RugPullTowerScene": {
        name: "Rug Pull Tower",
        description: "Haunted tower with Ghost types"
      },
      "DiamondHandsDojoScene": {
        name: "Diamond Hands Dojo",
        description: "Fighting type gym"
      },
      "BlockchainPlateauScene": {
        name: "Blockchain Plateau",
        description: "Elite Four and Champion battle"
      }
    };

    return maps[mapKey] || { name: "Unknown", description: "" };
  }
}
