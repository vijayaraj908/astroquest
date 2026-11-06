import { INITIAL_RESOURCES } from '../data/resourceConfig.js';

export default class ResourceManager {

  constructor() {
    this.resources = {
      ...INITIAL_RESOURCES
    };

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
        reason: 'This facility has already been activated.'
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

    // Apply all resource changes.
    for (const [resource, change] of Object.entries(changes)) {
      this.resources[resource] += change;
    }

    // Mark facility as activated.
    this.activatedFacilities.add(facility.id);

    return {
      success: true,
      message: 'Facility activated successfully.',
      changes: { ...changes },
      resources: this.getResources()
    };
  }

  isActivated(facilityId) {
    return this.activatedFacilities.has(facilityId);
  }

  reset() {
    this.resources = {
      ...INITIAL_RESOURCES
    };

    this.activatedFacilities.clear();
  }
}