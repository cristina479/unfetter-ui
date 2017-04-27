import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MdDialog, MdDialogRef } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BaseStixComponent } from '../../base-stix.component';
import { AttackPattern } from '../../../models';

@Component({
    selector: 'attack-patterns-home',
    templateUrl: './attack-patterns-home.component.html',

})
export class AttackPatternsHomeComponent {
    private pageTitle = 'Attack Pattern';
    private pageIcon = 'assets/icon/stix-icons/svg/attack-pattern-b.svg';

    constructor() {
        console.log('Initial AttackPatternsComponent');
    }
}
