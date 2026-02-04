import type{ FastifyPluginAsync } from 'fastify';
import { intentionsRoutes } from './intentions.routes.js';
import { leadsRoutes } from './leads.routes.js';


const routes: FastifyPluginAsync = async (fastify) => {
  fastify.register(intentionsRoutes, { prefix: '/intentions' });
  fastify.register(leadsRoutes, { prefix: '/leads' });
};

export default routes;