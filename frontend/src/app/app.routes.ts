import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { OfficesComponent } from './pages/offices/offices.component';
import { RegistrationComponent } from './pages/registration/registration.component';
import { OfficeComponent } from './pages/offices/office/office.component';
import { CreateWorkerComponent } from './pages/createWorker/createWorker.component';
import { WorkersComponent } from './pages/workers/workers.component';
import { AuthGuard } from '@services/guards/auth.guard';

export const routes: Routes = [
    {path: '', component: OfficesComponent},
    {path: 'login', component: LoginComponent},
    {path: 'offices', component: OfficesComponent},
    {path: 'registration', component: RegistrationComponent, canActivate: [AuthGuard]},
    {path: 'offices/:id', component: OfficeComponent, canActivate: [AuthGuard]},
    {path: 'worker/create', component: CreateWorkerComponent, canActivate: [AuthGuard]},
    {path: 'workers', component: WorkersComponent, canActivate: [AuthGuard]}
];
