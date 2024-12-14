import { DatabaseService } from '../services/databaseService';
import { supabaseServer } from '@/lib/supabaseServer';

class ServiceContainer {
  private instances: Map<string, any> = new Map();

  register<T>(key: string, instance: T) {
    this.instances.set(key, instance);
  }

  resolve<T>(key: string): T {
    const instance = this.instances.get(key);
    if (!instance) {
      throw new Error(`Service with key "${key}" not registered`);
    }
    return instance as T;
  }
}

const serviceContainer = new ServiceContainer();
serviceContainer.register<DatabaseService>('supabaseService', new DatabaseService(supabaseServer));
export default serviceContainer;
