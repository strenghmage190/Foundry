export class SystemActor extends Actor {
  /*
    Beyonders Actor subclass to expose agent helper methods and game system logic.
    Stores the web-app agent state under a system-scoped flag.
  */

  async getAgentData() {
    return await this.getFlag('beyonders', 'agentData') || null;
  }

  async setAgentData(data) {
    return await this.setFlag('beyonders', 'agentData', data);
  }

  async applyDamage(damage) {
    // Always take a minimum of 1 damage, and round to the nearest integer.
    damage = Math.round(Math.max(1, damage));

    // Update the health.
    const { value } = this.system.resources.health;
    await this.update({ "system.resources.health.value": value - damage });

    // Log a message.
    await ChatMessage.implementation.create({
      content: `${this.name} took ${damage} damage!`
    });
  }

  prepareDerivedData() {
    super.prepareDerivedData();

    // Clamp health within the appropriate range.
    const { health } = this.system.resources;
    health.value = Math.clamp(health.value, health.min, health.max);
  }
}
