import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { MatDialog, MatDialogRef, MatDialogConfig, MatSnackBar } from '@angular/material';
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
    public allCitations: any = [];
    public contributors: string[] = [];

    constructor(
        public stixService: StixService,
        public route: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public location: Location,
        public snackBar: MatSnackBar) {
        super(stixService, route, router, dialog, location, snackBar);
    }

    public ngOnInit() {
        const subscription =  super.get().subscribe(
            (data) => {
                this.tool = new Tool(data);
                this.tool.attributes.external_references.reverse();
                console.log(this.tool);
                this.getTechniques(false);
                this.getAllAliases();
                this.getCitationsAndContributors();
                this.assignCitations();
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

    public addContributor(): void {
        if (!('x_mitre_contributors' in this.tool.attributes)) {
            this.tool.attributes.x_mitre_contributors = [];
        }
        let contributorName = '';
        this.tool.attributes.x_mitre_contributors.unshift(contributorName);
    }

    public removeContributor(contributor): void {
        this.tool.attributes.x_mitre_contributors = this.tool.attributes.x_mitre_contributors.filter((h) => h !== contributor);
    }

    public assignCitations(): void {
        for (let i in this.tool.attributes.external_references) {
            this.tool.attributes.external_references[i].citeButton = 'Generate Citation Text';
            this.tool.attributes.external_references[i].citation = '[[Citation: ' + this.tool.attributes.external_references[i].source_name + ']]';
            this.tool.attributes.external_references[i].citeref = '[[CiteRef::' + this.tool.attributes.external_references[i].source_name + ']]';
        }
    }

    public addAliasesToTool(): void {
        this.tool.attributes.x_mitre_aliases = [];
        this.tool.attributes.x_mitre_aliases.push(this.tool.attributes.name);
        if (this.aliases.length > 0) {
            for (let alias of this.aliases){
                if (alias.name !== '') {
                    this.tool.attributes.x_mitre_aliases.push(alias.name);
                    if (alias.description !== '') {
                        let extRef = new ExternalReference();
                        extRef.source_name = alias.name;
                        extRef.description = alias.description;
                        this.tool.attributes.external_references.push(extRef);
                    }
                }
            }
        }
        console.log(this.tool.attributes.x_mitre_aliases);
    }

    public getCitationsAndContributors(): void {
        let uri = Constance.MULTIPLES_URL;
        let subscription =  super.getByUrl(uri).subscribe(
            (data) => {
                let extRefs = [];
                for (let currObj of data) {
                    if (currObj.attributes.external_references && currObj.attributes.external_references.source_name !== 'mitre-attack') {
                        extRefs = extRefs.concat(currObj.attributes.external_references);
                    }
                    this.contributors = this.contributors.concat(currObj.attributes.x_mitre_contributors);
                }
                this.contributors = this.contributors.filter((elem, index, self) => self.findIndex((t) => t === elem) === index).sort().filter(Boolean);
                console.log(this.contributors);
                extRefs = extRefs.sort((a, b) => a.source_name.toLowerCase() < b.source_name.toLowerCase() ? -1 : a.source_name.toLowerCase() > b.source_name.toLowerCase() ? 1 : 0);
                this.allCitations = extRefs.filter((citation, index, self) => self.findIndex((t) => t.source_name === citation.source_name) === index);
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

    public createRelationships(id: string): void {
        for (let technique of this.addedTechniques) {
            let currTechnique = this.techniques.filter((h) => h.name === technique.name);
            if (currTechnique.length > 0) {
                this.saveRelationship(id, currTechnique[0].id, technique.description, technique.relationship);
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

    public removeCitationsExtRefsContributors(): void {
        for (let i in this.tool.attributes.external_references) {
            if ('citeButton' in this.tool.attributes.external_references[i]) {
                delete this.tool.attributes.external_references[i].citeButton;
            }
            if ('citation' in this.tool.attributes.external_references[i]) {
                delete this.tool.attributes.external_references[i].citation;
            }
            if ('citeref' in this.tool.attributes.external_references[i]) {
                delete this.tool.attributes.external_references[i].citeref;
            }
        }
        for (let i = 0; i < this.tool.attributes.external_references.length; i++) {
            if (Object.keys(this.tool.attributes.external_references[i]).length === 0) {
                this.tool.attributes.external_references.splice(i, 1);
            }
        }
        if ('x_mitre_contributors' in this.tool.attributes) {
            this.removeContributor("");
            if (this.tool.attributes.x_mitre_contributors.length === 0) {
                delete this.tool.attributes['x_mitre_contributors'];
            }
        }
    }

    public saveTool(): void {
        this.addAliasesToTool();
        this.removeCitationsExtRefsContributors();
        this.tool.attributes.external_references.reverse();
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

    public filterOptions(stringToMatch: string, listToParse: any): void {
        if (stringToMatch) {
            let filterVal = stringToMatch.toLowerCase();
            return listToParse.filter((h) => h.toLowerCase().startsWith(filterVal));
        }
        return listToParse;
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
