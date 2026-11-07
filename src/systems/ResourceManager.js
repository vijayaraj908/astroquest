
import { INITIAL_RESOURCES } from '../data/resourceConfig.js';

export default class ResourceManager {
  constructor() {
    this.resources = {
      ...INITIAL_RESOURCES
    };

    // Tracks facilities operated during the current day.
    this.activatedFacilities = new Set();
  }

  getResources() {
    return {
      ...this.resources
    };
  }

  canActivate(facility) {
    if (!facility || !facility.operation) {
      return {
        allowed: false,
        reason: 'This facility has no resource operation.'
      };
    }

    if (this.activatedFacilities.has(facility.id)) {
      return {
        allowed: false,
        reason: 'This facility has already been operated today.'
      };
    }

    const changes = facility.operation;

    for (const [resource, change] of Object.entries(changes)) {
      const current = this.resources[resource];

      if (current === undefined) {
        return {
          allowed: false,
          reason: `Unknown resource: ${resource}`
        };
      }

      if (current + change < 0) {
        return {
          allowed: false,
          reason: `Insufficient ${resource}.`
        };
      }
    }

    return {
      allowed: true,
      reason: 'Resources available.'
    };
  }

  activateFacility(facility) {
    const validation = this.canActivate(facility);

    if (!validation.allowed) {
      return {
        success: false,
        message: validation.reason
      };
    }

    const changes = facility.operation;

    // Apply all resource changes after validation.
    for (const [resource, change] of Object.entries(changes)) {
      this.resources[resource] += change;
    }

    this.activatedFacilities.add(facility.id);

    return {
      success: true,
      message: 'Facility operation completed successfully.',
      changes: { ...changes },
      resources: this.getResources()
    };
  }
  
  
  consumeResource(resource, amount) {
    if (!Number.isFinite(amount) || amount < 0) {
      return {
        success: false,
        consumed: 0,
        shortage: 0
      };
    }

    if (this.resources[resource] === undefined) {
      return {
        success: false,
        consumed: 0,
        shortage: amount
      };
    }

    const available = Math.max(
      0,
      this.resources[resource]
    );

    const consumed = Math.min(
      available,
      amount
    );

    this.resources[resource] = available - consumed;

    return {
      success: true,
      consumed,
      shortage: amount - consumed,
      remaining: this.resources[resource]
    };
  }

  isActivated(facilityId) {
    return this.activatedFacilities.has(facilityId);
  }

  resetDailyActivations() {
    // Preserve inventory and allow operations again tomorrow.
    this.activatedFacilities.clear();
  }

  reset() {
    // Full game reset.
    this.resources = {
      ...INITIAL_RESOURCES
    };

    this.activatedFacilities.clear();
  }
}
