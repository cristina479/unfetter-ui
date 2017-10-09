import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { MdDialog, MdDialogRef, MdSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { Relationship } from '../models';
import { ConfirmationDialogComponent } from '../components/dialogs/confirmation/confirmation-dialog.component';
import { BaseStixService } from './base-stix.service';
import { Constance } from '../utils/constance';

export class BaseStixComponent {
    public filteredItems: any[];
    public allCitations: any = [];
    public allRels: any;
    private duration = 3000;

    constructor(
        public service: BaseStixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MdDialog,
        public location: Location,
        public snackBar?: MdSnackBar) {
    }

     public load(filter?: any): Observable<any[]> {
         const _self  = this;
         return Observable.create((observer) => {
               _self.loadItems(observer, filter);
         });
    }

    public get(): Observable<any> {
        const _self  = this;
        return Observable.create((observer) => {
               _self.getItem(observer);
        });
    }

    public getByUrl(url: string): Observable<any> {
        const _self  = this;
        return Observable.create((observer) => {
              const subscription =  _self.service.getByUrl(url).subscribe(
                   (data) => {
                        observer.next(data);
                        observer.complete();
                   }, (error: string) => {
                        // handle errors here
                        this.snackBar.open('Error ' + error , '', {
                            duration: this.duration,
                            extraClasses: ['snack-bar-background-error']
                        });
                    }, () => {
                        // prevent memory links
                        if (subscription) {
                            subscription.unsubscribe();
                        }
                    }
               );
        });
    }
    public create(item: any): Observable<any>  {
        const _self  = this;
        return Observable.create((observer) => {
               _self.createItem(item, observer);
        });
    }

    public save(item: any): Observable<any>  {
        const _self  = this;
        item.url = this.service.url;
        return Observable.create((observer) => {
               _self.saveItem(item, observer);
        });
    }

    public delete(item: any): Observable<any>  {
        const _self  = this;
        return Observable.create((observer) => {
               _self.deleteItem(item, observer);
        });
    }

    public gotoView(command: any[]): void {
        this.router.navigate(command, { relativeTo: this.route });
    }

    public openDialog(item: any): Observable<any> {
        const _self  = this;
        item.url = this.service.url;
        return Observable.create((observer) => {
            const dialogRef = _self.dialog.open(ConfirmationDialogComponent, { data: item });
            dialogRef.afterClosed().subscribe(
                (result) => {
                    if (result === 'true') {
                        _self.deleteItem(item, observer);
                    }
            });
        });
    }

    public download(): void {
        console.log('download');
    }

    public cancelButtonClicked(): void {
        this.location.back();
    }

    public onFilterItemsChange(filterItems: any[]): void {
        this.filteredItems = filterItems;
    }

    public loadItems(observer: any, filter?: any): void {
         const subscription = this.service.load(filter).subscribe(
            (stixObjects) => {
                observer.next(stixObjects);
                observer.complete();
            }, (error) => {
                // handle errors here
                this.snackBar.open('Error ' + error , '', {
                     duration: this.duration,
                     extraClasses: ['snack-bar-background-error']
                });
            }, () => {
                // prevent memory links
                if (subscription) {
                    subscription.unsubscribe();
                }
            }
        );
    }

    public getItem(observer: any): void {
       this.route.params
                .switchMap((params: Params) => this.service.get(params['id']))
                .subscribe(
                    (stixObject) => {
                        observer.next(stixObject);
                        observer.complete();
                    }, (error) => {
                        // handle errors here
                        this.snackBar.open('Error ' + error , '', {
                            duration: this.duration,
                            extraClasses: ['snack-bar-background-error']
                        });
                    }, () => {
                    // handle errors here
                    }
                );
    }

    public deleteItem(item: any, observer: any): void {
        this.route.params
            .switchMap((params: Params) => this.service.delete(item))
            .subscribe(
                (stixObject) => {
                    observer.next(stixObject);
                    observer.complete();
                    if('name' in item.attributes && item.type != 'course-of-action'){
                        this.snackBar.open(item.attributes.name + ' has been successfully deleted', '', {
                            duration: this.duration,
                            extraClasses: ['snack-bar-background-success']
                        });
                    }
                }, (error) => {
                    // handle errors here
                    this.snackBar.open('Error ' + error , '', {
                        duration: this.duration,
                        extraClasses: ['snack-bar-background-error']
                    });
                    observer.throw = '';
                }, () => {
                   // handle errors here
                }
            );
    }

    public createItem(item: any, observer: any): void {
        const subscription = this.service.create(item).subscribe(
            (data) => {
                observer.next(data);
                observer.complete();
                if('name' in item.attributes && item.type != 'course-of-action'){
                    this.snackBar.open(item.attributes.name + ' has been successfully saved', '', {
                        duration: this.duration,
                        extraClasses: ['snack-bar-background-success']
                    });
                }
                // data.url = item.url;
                // let sub = this.service.update(data).subscribe(
                //     (resullts) => {
                //         observer.next(data);
                //         observer.complete();
                //         this.snackBar.open(item.attributes.name + ' has been successfully save', '', {
                //             duration: this.duration,
                //             extraClasses: ['snack-bar-background-success']
                //         });
                //     } , (error) => {
                //         // handle errors here
                //         // roollback create
                //         this.deleteItem(data, observer);
                //         this.snackBar.open('Error ' + error , '', {
                //             duration: this.duration,
                //             extraClasses: ['snack-bar-background-error']
                //         });
                //     }, () => {
                //         // prevent memory links
                //         if (sub) {
                //             sub.unsubscribe();
                //         }
                //     }
                // );
            }, (error) => {
                // handle errors here
                this.snackBar.open('Error ' + error , '', {
                    duration: this.duration,
                    extraClasses: ['snack-bar-background-error']
                });
            }, () => {
                // prevent memory links
                if (subscription) {
                    subscription.unsubscribe();
                }
            }
        );
    }

    public saveItem(item: any, observer: any): void {
        const subscription = this.service.update(item).subscribe(
            (data) => {
                observer.next(data);
                observer.complete();
                if('name' in item.attributes && item.type != 'course-of-action'){
                    this.snackBar.open(item.attributes.name + ' has been successfully saved', '', {
                        duration: this.duration,
                        extraClasses: ['snack-bar-background-success']
                    });
                }
            }, (error) => {
                // handle errors here
                this.snackBar.open('Error ' + error , '', {
                    duration: this.duration,
                    extraClasses: ['snack-bar-background-error']
                });
            }, () => {
                // prevent memory links
                if (subscription) {
                    subscription.unsubscribe();
                }
            }
        );
    }

    public getCitations(): void {
        let uri = Constance.ATTACK_PATTERN_URL;
        let subscription =  this.getByUrl(uri).subscribe(
            (data) => {
                let techniques = data as AttackPattern[];
                console.log(techniques);
                techniques.forEach((attackPattern: AttackPattern) => {
                    for (let i in attackPattern.attributes.external_references){
                        if(!(attackPattern.attributes.external_references[i].external_id)){
                            this.allCitations.push(attackPattern.attributes.external_references[i]);
                        }
                    }
                });
                this.allCitations = this.allCitations.sort((a,b) => a.source_name.toLowerCase() < b.source_name.toLowerCase() ? -1 : a.source_name.toLowerCase() > b.source_name.toLowerCase() ? 1 : 0);
                console.log(this.allCitations);
               }, (error) => {
                // handle errors here
                 console.log('error ' + error);
            }, () => {
                // prevent memory links
                if (subscription) {
                    subscription.unsubscribe();
                }
            }
        );
    }
    public deleteRels(id: string): void {
        let uri = Constance.RELATIONSHIPS_URL
        let subscription =  this.getByUrl(uri).subscribe(
            (data) => {
                this.allRels = data as Relationship[];
                console.log(id);
                console.log(this.allRels);
                if(this.allRels.length > 0){
                    let allRelationships = this.allRels.filter((r) => {
                        return r.attributes.source_ref === id || r.attributes.target_ref === id ;
                    });
                    for(let relationship of allRelationships){
                        console.log(relationship);
                        relationship.url = Constance.RELATIONSHIPS_URL;
                        relationship.id = relationship.attributes.id;
                        this.delete(relationship).subscribe(
                            () => {
                            }
                        );
                    }
                }
               }, (error) => {
                // handle errors here
                 console.log('error ' + error);
            }, () => {
                // prevent memory links
                if (subscription) {
                    subscription.unsubscribe();
                }
            }
        );
    }
}
