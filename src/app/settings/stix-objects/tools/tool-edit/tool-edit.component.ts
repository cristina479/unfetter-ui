import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { MdDialog, MdDialogRef, MdDialogConfig, MdSnackBar } from '@angular/material';
import { ToolComponent } from '../tool/tool.component';
import { StixService } from '../../../stix.service';
import { Tool, AttackPattern, Indicator, IntrusionSet, CourseOfAction, Filter, Relationship, ExternalReference } from '../../../../models';
import { Constance } from '../../../../utils/constance';

@Component({
  selector: 'tool-edit',
  templateUrl: './tool-edit.component.html',
})
export class ToolEditComponent extends ToolComponent implements OnInit {

    public attackPatterns: AttackPattern[] = [];
    public indicators: Indicator[] = [];
    public courseOfActions: CourseOfAction[] = [];
    public intrusionSets: IntrusionSet[] = [];
    public newRelationships: Relationship[] = [];
    public savedRelationships: Relationship[] = [];
    public deletedRelationships: Relationship[] = [];

    constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MdDialog,
        public location: Location,
        public snackBar: MdSnackBar) {
        super(stixService, route, router, dialog, location, snackBar);
    }

    public ngOnInit() {
        const subscription =  super.get().subscribe(
            (data) => {
                this.tool = new Tool(data);
                console.log(this.tool);
                this.getTechniques(false);
                this.getAllAliases();
                super.getCitations();
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

    public addAliasesToTool(): void {
        if (this.aliases.length > 0) {
            this.tool.attributes.x_mitre_aliases = [];
            this.tool.attributes.x_mitre_aliases.push(this.tool.attributes.name);
            for (let alias of this.aliases){
                this.tool.attributes.x_mitre_aliases.push(alias.name);
                if (alias.description !== '') {
                    let extRef = new ExternalReference();
                    extRef.source_name = alias.name;
                    extRef.description = alias.description;
                    this.tool.attributes.external_references.push(extRef);
                }
            }
        }
        console.log(this.tool.attributes.x_mitre_aliases);
    }

    public createRelationships(id: string): void {
        for (let technique of this.addedTechniques) {
            let currTechnique = this.techniques.filter((h) => h.name === technique.name);
            if (currTechnique.length > 0) {
                this.saveRelationship(currTechnique[0].id, id, technique.description, technique.relationship);
            }
            console.log(technique.relationship);
            console.log(this.origRels);
            this.origRels = this.origRels.filter((h) => h.id !== technique.relationship);
        }
    }

    public saveRelationship(source_ref: string, target_ref: string, description: string, id: string): void {
        let relationship = new Relationship();
        relationship.attributes.source_ref = source_ref;
        relationship.attributes.target_ref = target_ref;
        if (description !== '') {
          relationship.attributes.description = description;
        }
        relationship.attributes.relationship_type = 'uses';
        if (id !== '') {
            relationship.id = id;
            console.log(relationship);
            this.stixService.url = Constance.RELATIONSHIPS_URL;
            let subscription = super.save(relationship).subscribe(
                (data) => {
                    console.log(data);
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
        } else {
            let subscription = super.create(relationship).subscribe(
                (data) => {
                    console.log(data);
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

    public saveTool(): void {
        this.addAliasesToTool();
        let sub = super.saveButtonClicked().subscribe(
            (data) => {
                this.location.back();
                this.createRelationships(data.id);
                this.removeRelationships(data.id);
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

    public addTechnique(): void {
        let currTechnique = {};
        currTechnique['name'] = '';
        currTechnique['description'] = '';
        currTechnique['relationship'] = '';
        this.addedTechniques.unshift(currTechnique);
        this.currTechniques.unshift(this.techniques);
        for (let i in this.addedTechniques) {
            this.currTechniques[0] = this.currTechniques[0].filter((h) => h.name !== this.addedTechniques[i].name);
        }
        console.log(this.currTechniques);
    }

    public removeTechnique(technique: string, i: number): void {
        this.addedTechniques = this.addedTechniques.filter((h) => h.name !== technique);
        this.currTechniques.splice(i, 1);
        for (let index in this.currTechniques) {
            this.currTechniques[index] = this.techniques;
            for (let j in this.addedTechniques) {
                if (j !== index) {
                    this.currTechniques[index] = this.currTechniques[index].filter((h) => h.name !== this.addedTechniques[j].name)
                }
            }
        }
    }

    public loadRelationships(filter: any): void {
        let url = Constance.RELATIONSHIPS_URL + '?filter=' + JSON.stringify(filter);
        let sub =  super.getByUrl( encodeURI(url) ).subscribe(
        (data) => {
            this.savedRelationships = data as Relationship[];
            this.savedRelationships.forEach(
                (relationship) => {
                    if (filter['stix.source_ref']) {
                        this.loadStixObject(relationship.attributes.target_ref);
                    } else {
                        this.loadStixObject(relationship.attributes.source_ref);
                    }
                }
            );
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

    public checkAddedTechniques(): void {
        for (let index in this.currTechniques) {
            this.currTechniques[index] = this.techniques;
            for (let i in this.addedTechniques) {
                if (i !== index) {
                    this.currTechniques[index] = this.currTechniques[index].filter((h) => h.name !== this.addedTechniques[i].name)
                }
            }
        }
        console.log(this.currTechniques);
    }

    public found(list: any[], object: any): any {
        return list.find( (entry) => { return entry.id === object.id; } );
    }

    public loadStixObject(id: string): void {

        if (id.indexOf('indicator') >= 0) {
            this.loadObject(Constance.INDICATOR_URL, id, this.indicators);
        } else if (id.indexOf('attack-pattern') >= 0) {
            this.loadObject(Constance.ATTACK_PATTERN_URL, id, this.attackPatterns);
        } else if (id.indexOf('course-of-action') >= 0) {
            this.loadObject(Constance.COURSE_OF_ACTION_URL, id, this.courseOfActions);
        } else if (id.indexOf('intrusion-set') >= 0) {
            this.loadObject(Constance.INTRUSION_SET_URL, id, this.intrusionSets);
        }
    }

    public removeRelationships(id: string): void {
        for (let rel of this.origRels) {
            rel.url = Constance.RELATIONSHIPS_URL;
            rel.id = rel.attributes.id;
            this.delete(rel).subscribe(
                () => {
                }
            );
        }
    }

    public addAlias(): void {
        let alias = {};
        alias['name'] = '';
        alias['description'] = '';
        this.aliases.unshift(alias);
    }

    public removeAlias(alias): void {
        this.aliases = this.aliases.filter((h) => h.name !== alias);
    }

    public loadObject(url: string, id: string, list: any ): void {
        const uri = `${url}/${id}`;
        let sub = super.getByUrl(uri).subscribe(
            (data) => {
                list.push(data);
            }, (error) => {
                console.log(error);
            }, () => {
                if (sub) {
                    sub.unsubscribe();
                }
            }
        );
    }
}
