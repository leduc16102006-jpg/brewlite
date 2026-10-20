import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(() => {
    appService = new AppService();
    appController = new AppController(appService);
  });

  describe('root', () => {
    it('should return "Hello BrewLite Backend Siuuuuuuuu!!!!"', () => {
      expect(appController.getHello()).toBe('Hello BrewLite Backend Siuuuuuuuu!!!!');
    });
  });
});