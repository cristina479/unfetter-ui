import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/startWith';
import { KillChainPhase } from '../../models';

@Component({
  selector: 'kill-chain-phases',
  templateUrl: './kill-chain-phases.component.html'
})
export class KillChainPhasesComponent implements ngOnChanges{

    @Input() public model: any;
    @Output() onTacticAdd: EventEmitter<any> = new EventEmitter<any>();
    public tacticBools: any = {'privEsc': false, 'execution': false, 'defEvas': false, 'exfil': false};
    private tactics: string[] = [
      {'name':'collection', 'val': false},
      {'name': 'command-and-control', 'val': false},
      {'name': 'credential-access', 'val': false},
      {'name':'defense-evasion', 'val': false},
      {'name': 'discovery', 'val': false},
      {'name': 'execution', 'val': false},
      {'name': 'exfiltration', 'val': false},
      {'name': 'lateral-movement', 'val': false},
      {'name': 'persistence', 'val': false},
      {'name': 'privilege-escalation', 'val': false}
    ];

    ngOnChanges(){
        for (let i in this.tactics){
            if(this.foundTactic(this.tactics[i]['name']){
                this.tactics[i]['val'] = true;
                this.emitTactic(this.tactics[i]['name'], true);
            }
        }
        this.emitTactic(null, false);
    }

    public emitTactic(tactic: string, wait: boolean){
        if(tactic === 'privilege-escalation'){
            this.tacticBools['privEsc'] = !this.tacticBools['privEsc'];
        }
        if(tactic === 'execution'){
            this.tacticBools['execution'] = !this.tacticBools['execution'];
        }
        if(tactic === 'defense-evasion'){
            this.tacticBools['defEvas'] = !this.tacticBools['defEvas'];
        }
        if(tactic === 'exfiltration'){
            this.tacticBools['exfil'] = !this.tacticBools['exfil'];
        }
        if(!wait){
          this.onTacticAdd.emit(this.tacticBools);
        }
    }

    public addRemoveTactic(tactic: string) {
        this.emitTactic(tactic, false);
        if ( this.foundTactic(tactic) ) {
            this.model.attributes.kill_chain_phases = this.model.attributes.kill_chain_phases.filter((h) => h.phase_name != tactic );
        } else {
            let killChainPhase = new KillChainPhase();
            killChainPhase.kill_chain_name = 'mitre-attack';
            killChainPhase.phase_name = tactic;
            this.model.attributes.kill_chain_phases.push(killChainPhase);
        }
    }

    public foundTactic(tactic: string): boolean {
        let found = this.model.attributes.kill_chain_phases.find((h) => {
            return h.phase_name == tactic;
        });
        return found ? true : false;
    }
}
