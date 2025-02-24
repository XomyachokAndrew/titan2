import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { OfficesComponent } from './pages/offices/offices.component';
import { RegistrationComponent } from './pages/registration/registration.component';
import { OfficeComponent } from './pages/offices/office/office.component';
import { CreateWorkerComponent } from './pages/createWorker/createWorker.component';

export const routes: Routes = [
    {path: '', component: OfficesComponent},
    {path: 'login', component: LoginComponent},
    {path: 'offices', component: OfficesComponent},
    {path: 'registration', component: RegistrationComponent},
    {path: 'offices/:id', component: OfficeComponent},
    {path: 'worker/create', component: CreateWorkerComponent}
];
