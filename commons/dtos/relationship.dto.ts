import {Builder} from './builder.dto';
import {ILink, IHasLinks} from './link.dto';
import {IHrefValue} from './hrefValue.dto';
import {IName, Name} from './name.dto';
import {IParty, Party} from './party.dto';
import {IRelationshipAttribute, RelationshipAttribute} from './relationshipAttribute.dto';
import {RelationshipType, IRelationshipType} from './relationshipType.dto';

export interface IRelationship extends IHasLinks {
    relationshipType: IHrefValue<IRelationshipType>;
    subject: IHrefValue<IParty>;
    subjectNickName?: IName;
    delegate: IHrefValue<IParty>;
    delegateNickName?: IName;
    startTimestamp: Date;
    endTimestamp?: Date;
    endEventTimestamp?: Date;
    status: string;
    initiatedBy: string;
    attributes: IRelationshipAttribute[];
    getAttribute(code: string): IRelationshipAttribute;
    insertOrUpdateAttribute(attribute: IRelationshipAttribute): void;
    deleteAttribute(code: string): void;
}

export class Relationship implements IRelationship {

    public static build(sourceObject: any): IRelationship {
        return new Builder<IRelationship>(sourceObject, this)
            .mapHref('relationshipType', RelationshipType)
            .mapHref('subject', Party)
            .mapHref('delegate', Party)
            .map('subjectNickName', Name)
            .map('delegateNickName', Name)
            .mapArray('attributes', RelationshipAttribute)
            .build();
    }

    constructor(public _links: ILink[],
                public relationshipType: IHrefValue<IRelationshipType>,
                public subject: IHrefValue<IParty>,
                public subjectNickName: Name,
                public delegate: IHrefValue<IParty>,
                public delegateNickName: Name,
                public startTimestamp: Date,
                public endTimestamp: Date,
                public endEventTimestamp: Date,
                public status: string,
                public initiatedBy: string,
                public attributes: IRelationshipAttribute[]) {
    }

    public getAttribute(code: string): IRelationshipAttribute {
        for (let attribute of this.attributes) {
            if (attribute.attributeName.value.code === code) {
                return attribute;
            }
        }
        return null;
    }

    public insertOrUpdateAttribute(attribute: IRelationshipAttribute) {
        if (attribute) {
            this.deleteAttribute(attribute.attributeName.value.code);
            this.attributes.push(attribute);
        }
    }

    public deleteAttribute(code: string) {
        if (code) {
            for (let i = 0; i < this.attributes.length; i = i + 1) {
                let aAttribute = this.attributes[i];
                if (aAttribute.attributeName.value.code === code) {
                    this.attributes.splice(i, 1);
                    break;
                }
            }
        }
    }

}