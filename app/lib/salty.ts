
export class Salty {
  private static _instance: Salty | null = null;
  
  private generated: number = 0;
  private length: number = 4;
  
  private constructor() {}
  
  private static instance() {
    if (Salty._instance) return Salty._instance;
    Salty._instance = new Salty();
    return Salty._instance;
  }
  
  
  static new() {
    const self = Salty.instance();
    self.generated += 1;
    return {
      salt: String(self.generated).padStart(self.length, "0"),
      length: self.length,
    }
  }
}
