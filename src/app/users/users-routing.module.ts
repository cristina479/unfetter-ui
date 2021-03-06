import { RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

import { LoginCallbackComponent } from './login-callback/login-callback.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';

const routes = [
    {
        path: 'login-callback/:token/:registered/:method', component: LoginCallbackComponent,        
    },
    {
        path: 'register', component: RegisterComponent,
    },
    {
        path: 'profile/:id', component: ProfileComponent
    },
    {
        path: 'settings', component: SettingsComponent
    }
]

export const routing = RouterModule.forChild(routes);
