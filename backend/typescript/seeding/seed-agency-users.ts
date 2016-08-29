import {IAgencyUser, AgencyUser, AgencyUserProgramRole} from '../models/agencyUser.model';

// seeder .............................................................................................................

const users: IAgencyUser[] = [

    new AgencyUser(
        'ted_agent',
        'Ted',
        'Agent',
        'Ted Agent',
        'Department of Education',
        [
            new AgencyUserProgramRole('EDUCATION', 'ROLE_ADMIN')
        ]
    ),

    new AgencyUser(
        'max_agent',
        'Max',
        'Agent',
        'Max Agent',
        'Australian Tax Office',
        [
            new AgencyUserProgramRole('TAX', 'ROLE_ADMIN')
        ]
    ),

    new AgencyUser(
        'all_agent',
        'All',
        'Agent',
        'All Agent',
        'The Government',
        [
            new AgencyUserProgramRole('EDUCATION', 'ROLE_ADMIN'),
            new AgencyUserProgramRole('TAX', 'ROLE_ADMIN')
        ]
    )

];

export class AgencyUsersSeeder {

    public static findById(id: string): IAgencyUser {
        for (let i = 0; i < users.length; i = i + 1) {
            let user = users[i];
            if (user.id === id) {
                return user;
            }
        }
        return null;
    }

    public static all(): IAgencyUser[] {
        return users;
    }

}
