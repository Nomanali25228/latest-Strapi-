'use strict';

/**
 * firstname service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::firstname.firstname');
