import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Profile } from './pages/profile/profile';
import { authGuard } from './auth-guard';
import { Places } from './pages/places/places';



export const routes: Routes = [
    {path: '', component: Home},
    {path: 'about', component:About},
    {path: 'profile', component:Profile, canActivate: [authGuard]},
    {path: 'places', component:Places}
];
