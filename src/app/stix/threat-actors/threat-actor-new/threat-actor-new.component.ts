import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { MdDialog, MdDialogRef, MdDialogConfig } from '@angular/material';
import { BaseStixComponent } from '../../base-stix.component';
import { StixService } from '../../stix.service';
import { ThreatActor } from '../../../models';

@Component({
  selector: 'threat-actor-new',
  templateUrl: './threat-actor-new.component.html',
})
export class ThreatActorNewComponent extends BaseStixComponent implements OnInit {

    private threatActor: ThreatActor = new ThreatActor();

     private labels = [
        {label: 'activist'},
        {label: 'competitor'},
        {label: 'crime-syndicate'},
        {label: 'criminal'},
        {label: 'hacker'},
        {label: 'insider-accidental'},
        {label: 'insider-disgruntled'},
        {label: 'nation-state'},
        {label: 'sensationalist'},
        {label: 'spy'},
        {label: 'terrorist'}
    ];
    constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MdDialog,
        public location: Location) {

        super(stixService, route, router, dialog, location);

        console.log('Initial ThreatActorNewComponent');
    }

    public ngOnInit() {
        console.log('Initial ThreatActorNewComponent');
    }

    public addLabel(label: string) {
        this.threatActor.attributes.labels.push(label);
    }

    public saveButtonClicked(): void {
        let subscription = super.save(this.threatActor).subscribe(
            (data) => {
                this.threatActor = data as ThreatActor;
                this.location.back();
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