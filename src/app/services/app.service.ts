import { getTestBed } from '@angular/core/testing';
import { HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
// import { User } from './../models/user.model';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class AppService {
    // user: User;
    protected _url = environment.API;
    protected headers: any;
    constructor(private _http: HttpClient) {

    }

    upload(data): Observable<any> {
        this.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        this.headers.append('Accept', 'application/json');
        let postOptions = Object.assign({ headers: this.headers, method: 'post' }, { withCredentials: true });
        return this._http.post(this._url + '/upload', data, postOptions)
            .pipe(
                map(this.extractData),
                catchError(this.handleError)
            );
    }

    search(data) {
        return this._http.get(this._url + '/search/' + data,
            this.get_options())// Object.assign(this.post_options(), { withCredentials: true }))
            .pipe(
                map(this.extractData),
                catchError(this.handleError)
            );
    }

    fetchData(data) {
        return this._http.get(this._url + '/fetch/' + data,
            this.get_options())// Object.assign(this.post_options(), { withCredentials: true }))
            .pipe(
                map(this.extractData),
                catchError(this.handleError)
            );
    }

    protected post_options() {
        this.setHeaders();
        return Object.assign({ headers: this.headers, method: 'post' }, { withCredentials: true });
    }

    protected get_options() {
        this.setHeaders();
        return Object.assign({ headers: this.headers, method: 'get' }, { withCredentials: true });
    }

    setHeaders() {
        this.headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }

    protected extractData(res: HttpResponse<any>) {
        return res['data'] || {};
    }

    protected handleError(res: HttpErrorResponse) {
        const errorBody = res['error'];
        console.log('HttpErrorResponse ====>>>', res);
        if (errorBody.error && (errorBody.error.code === 'TokenExpiredError' || errorBody.error.message == 'No auth token')) {
            window.location.href = `${environment.PROTOCOL}${environment.APP_EXTENSION}`
        }
        return throwError(errorBody);
    }
}