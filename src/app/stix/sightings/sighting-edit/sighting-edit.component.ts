import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { MdDialog, MdDialogRef, MdDialogConfig } from '@angular/material';
import { BaseStixComponent } from '../../base-stix.component';
import { StixService } from '../../stix.service';
import { Sighting } from '../../../models';

@Component({
  selector: 'sighting-edit',
  templateUrl: './sighting-edit.component.html',
})
export class SightingEditComponent extends BaseStixComponent implements OnInit {

  private sighting: Sighting = new Sighting();
  private sourceTypes = ['Indicator', 'Campaign', 'Intrusion Set' ];

    constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MdDialog,
        public location: Location) {

        super(stixService, route, router, dialog, location);
        stixService.url = 'cti-stix-store-api/sightings';
        console.log('Initial SightingEditComponent');
    }
    public ngOnInit() {
        console.log('Initial SightingEditComponent');
        let sub = super.get().subscribe(
            (data) => {
                this.sighting = data as Sighting;
            }, (err) => {
                 // handle errors here
                 console.log('error ' + err);
            }, () => {
               if (sub) {
                    sub.unsubscribe();
                }
            }
        );
    }

    public saveButtonClicked(): void {
        let sub = super.save(this.sighting).subscribe(
            (data) => {
                this.sighting = data as Sighting;
            }, (error) => {
                // handle errors here
                 console.log('error ' + error);
            }, () => {
                // prevent memory links
                if (sub) {
                    sub.unsubscribe();
                }
            }
        );
    }
}
