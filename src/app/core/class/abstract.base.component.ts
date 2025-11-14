import { Component, OnDestroy } from "@angular/core";

@Component({
    template: ''
})
export abstract class AbstractBaseComponent {
    public adminRole:string = 'Admin';
    public memberRole:string = 'Member';
    public trainerRole:string = 'Trainer';
    public getValue(obj: any, val: any, defaultValue: any = null): any {
        return (obj == null || !obj.hasOwnProperty(val)) ? defaultValue : obj[val];
    }
}