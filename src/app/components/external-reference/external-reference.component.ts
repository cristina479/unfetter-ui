import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/startWith';
import { ExternalReference } from '../../models';

@Component({
  selector: 'external-reference',
  templateUrl: './external-reference.component.html'
})
export class ExternalReferenceComponent {

    @Input() public model: any;
    @Input() public citations: any;

    public addExternalReferenceButtonClicked(): void {
        let externalReference = new ExternalReference();
        this.model.attributes.external_references.unshift(externalReference);
    }

    public removeExternalReferenceButtonClicked(externalReference: ExternalReference): void {
        this.model.attributes.external_references = this.model.attributes.external_references.filter((h) => h !== externalReference);
    }

    public generateCitation(citationStr: string): void {
        let match = this.model.attributes.external_references.find((h) => h.source_name === citationStr);
        let index = this.model.attributes.external_references.indexOf(match);
        this.model.attributes.external_references[index].citation = "[[Citation: " + citationStr + "]]";
    }

    public populateCitation(citationStr: string): void {
        let match = this.model.attributes.external_references.find((h) => h.source_name === citationStr);
        let index = this.model.attributes.external_references.indexOf(match);
        let citation = this.citations.find((h) => h.source_name === citationStr);
        console.log(citationStr);
        this.model.attributes.external_references[index].external_id = citation.external_id;
        this.model.attributes.external_references[index].description = citation.description;
        this.model.attributes.external_references[index].url = citation.url;
    }
}
