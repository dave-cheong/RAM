import {conf} from '../bootstrap';
import * as mongoose from 'mongoose';
import {
    RelationshipTypeModel
} from '../models/relationshipType.model';
import {IdentityModel} from '../models/identity.model';
import {RelationshipModel, IRelationship} from '../models/relationship.model';

export class ExampleDataExport {
    private toc: string[] = [];
    private content: string[] = [];

    /* tslint:disable:max-func-body-length */
    public async dump() {

        await mongoose.connect(conf.mongoURL);

        console.log(`\nConnected to the db: ${conf.mongoURL}`);
        console.log('');
        console.log('');
        console.log('');

        this.toc.push('# Table of Contents');

        // Identity
        this.add(await IdentityModel.createInvitationCodeIdentity('Homer','Simpson','01/01/2000'), 'Identity : INVITATION_CODE');
        this.add(await IdentityModel.findByIdValue('PUBLIC_IDENTIFIER:ABN:cakerybakery_identity_1'), 'Identity : ABN');

        // RelationshipType
        this.add(
            await RelationshipTypeModel.findByCodeIgnoringDateRange('UNIVERSAL_REPRESENTATIVE'),
            'RelationshipType : UNIVERSAL_REPRESENTATIVE'
        );

        this.add(
            await RelationshipTypeModel.findByCodeIgnoringDateRange('CUSTOM_REPRESENTATIVE'),
            'RelationshipType : CUSTOM_REPRESENTATIVE'
        );

        // Relationship
        const associate:IRelationship = await RelationshipModel.findOne({
            '_delegateNickNameString' : 'Jennifer Maxims',
            '_subjectNickNameString' : 'Jen\'s Catering Pty Ltd',
            '_relationshipTypeCode' : 'ASSOCIATE'
        });
        this.add(await RelationshipModel.findByIdentifier(associate.id), 'Relationship : Associate');

        const custom = await RelationshipModel.findOne({
            '_delegateNickNameString' : 'Jennifer Maxims',
            '_subjectNickNameString' : 'Cakery Bakery Pty Ltd',
            '_relationshipTypeCode' : 'CUSTOM_REPRESENTATIVE'
        });
        this.add(await RelationshipModel.findByIdentifier(custom.id), 'Relationship : Custom Representative');

        const universal = await RelationshipModel.findOne({
            '_delegateNickNameString' : 'Zoe Zombie 001',
            '_subjectNickNameString' : 'Jen\'s Catering Pty Ltd',
            '_relationshipTypeCode' : 'UNIVERSAL_REPRESENTATIVE'
        });
        this.add(await RelationshipModel.findByIdentifier(universal.id), 'Relationship : Universal Representative');

        this.printData();

        await mongoose.connection.close();
    }

    private printData() {
        for(let line of this.toc) {
            console.log(line);
        }
        console.log();

        for(let line of this.content) {
            console.log(line);
        }
    }

    private add(data:Object, name:string) {
        this.toc.push(`1. [${name}](#${name.split(' ').join('-')})`);
        this.content.push(`## ${name}`);
        this.content.push('```');
        this.content.push(JSON.stringify(data, null, 2));
        this.content.push('```');
        this.content.push('');
    }
}

new ExampleDataExport().dump();