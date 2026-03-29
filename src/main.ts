import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Kindle polyfill for generic errors
(window as any).onerror = function(msg: string, url: string, line: number) {
  const errDiv = document.createElement('div');
  errDiv.style.position = 'fixed';
  errDiv.style.top = '0';
  errDiv.style.background = 'white';
  errDiv.style.color = 'black';
  errDiv.style.zIndex = '9999';
  errDiv.innerHTML = 'Kindle Error: ' + msg + ' (line ' + line + ')';
  document.body.appendChild(errDiv);
};

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
