import path from 'path';
import { EventEmitter } from 'events';
import { app, BrowserWindow } from 'electron';
import { ipcMain } from 'hadron-ipc';
import createDebug from 'debug';
import { CompassLogging } from './logging';
import { CompassWindowManager } from './window-manager';
import { CompassMenu } from './menu';

const debug = createDebug('mongodb-compass:main:application');

class CompassApplication {
  private constructor() {
    // marking constructor as private to disallow usage
  }

  private static emitter: EventEmitter = new EventEmitter();

  private static initPromise: Promise<void> | null = null;

  private static async _init() {
    if (require('electron-squirrel-startup')) {
      debug('electron-squirrel-startup event handled sucessfully');
      return;
    }

    this.setupUserDirectory();

    await Promise.all([
      this.setupLogging(),
      this.setupAutoUpdate(),
      this.setupSecureStore(),
    ]);

    this.setupJavaScriptArguments();
    this.setupLifecycleListeners();
    this.setupApplicationMenu();
    this.setupWindowManager();
  }

  static init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }
    this.initPromise = this._init();
    return this.initPromise;
  }

  private static async setupSecureStore(): Promise<void> {
    // importing storage-mixin attaches secure-store ipc listeners to handle
    // keychain requests from the renderer processes
    await import('storage-mixin');
  }

  private static setupJavaScriptArguments(): void {
    // Enable ES6 features
    app.commandLine.appendSwitch('js-flags', '--harmony');
    // For Linux users with drivers that are avoided by Chromium we disable the
    // GPU check to attempt to bypass the disabled WebGL settings.
    app.commandLine.appendSwitch('ignore-gpu-blacklist', 'true');
  }

  private static async setupAutoUpdate(): Promise<void> {
    if (process.env.HADRON_ISOLATED !== 'true') {
      // This is done asyncronously so that webpack can completely remove
      // autoupdater from the application bundle during compilation
      const { CompassAutoUpdateManager } = await import(
        './auto-update-manager'
      );
      CompassAutoUpdateManager.init();
    }
  }

  private static setupApplicationMenu(): void {
    CompassMenu.init(this);
  }

  private static setupWindowManager(): void {
    void CompassWindowManager.init(this);
  }

  private static setupLifecycleListeners(): void {
    app.on('window-all-closed', function () {
      debug('All windows closed. Waiting for a new connection window.');
    });

    ipcMain.respondTo({
      'license:disagree': function () {
        debug('Did not agree to license, quitting app.');
        app.quit();
      },
    });
  }

  private static setupUserDirectory(): void {
    if (process.env.NODE_ENV === 'development') {
      const appName = app.getName();
      // When NODE_ENV is dev, we are probably running the app unpackaged
      // directly with Electron binary which causes user dirs to be just
      // `Electron` instead of app name that we want here
      app.setPath('userData', path.join(app.getPath('appData'), appName));
      app.setPath('userCache', path.join(app.getPath('cache'), appName));
    }
  }

  private static async setupLogging(): Promise<void> {
    const home = app.getPath('home');
    const appData = process.env.LOCALAPPDATA || process.env.APPDATA;
    const logDir =
      process.env.MONGODB_COMPASS_TEST_LOG_DIR || process.platform === 'win32'
        ? path.join(appData || home, 'mongodb', 'compass')
        : path.join(home, '.mongodb', 'compass');

    app.setAppLogsPath(logDir);

    await CompassLogging.init(this);
  }

  static on(
    event: 'show-connect-window',
    handler: () => void
  ): typeof CompassApplication;
  static on(
    event: 'show-log-file-dialog',
    handler: () => void
  ): typeof CompassApplication;
  // @ts-expect-error typescript is not happy with this overload even though it
  //                  worked when it wasn't static and the implementation does
  //                  match the overload declaration
  static on(
    event: 'new-window',
    handler: (bw: BrowserWindow) => void
  ): typeof CompassApplication;
  static on(
    event: string,
    handler: (...args: unknown[]) => void
  ): typeof CompassApplication {
    this.emitter.on(event, handler);
    return this;
  }

  static emit(event: 'show-connect-window'): boolean;
  static emit(event: 'show-log-file-dialog'): boolean;
  static emit(event: 'new-window', bw: BrowserWindow): boolean;
  static emit(event: string, ...args: unknown[]): boolean {
    return this.emitter.emit(event, ...args);
  }
}

export { CompassApplication };
