import { ANY } from '../shared/common';

export const responses = {
    development: {
        en: {
            ASSIGNMENT_DOES_NOT_FALL_FOR_DOCTOR: {
                message: 'Assignment does not fall in user provider day/timmings',
                status: 400
            },
            ASSIGNMENT_DOES_NOT_FALL_FOR_SPECIALITY: {
                message: 'Assignment does not fall in practice day/timmings',
                status: 400
            },
            INTERNAL_SERVER_ERROR: {
                message: 'Internal server error',
                status: 500
            },
            INVALID_SESSION_TYPE: {
                message: 'Invalid session type',
                status: 400
            },
            INVALID_TOKEN: {
                message: 'Invalid Token',
                status: 400
            },
            NO_DOCTOR_FOUND: {
                message: 'No doctor exist for specified id',
                status: 400
            },
            NO_FACILITY_LOCATION_FOUND: {
                message: 'No facility location exist for specified id',
                status: 400
            },
            NO_RECORD_FOUND: {
                message: 'No record exists in the system.',
                status: 400
            },
            NO_SPECIALITY_ASSIGNMENT_FOUND: {
                message: 'No speciality assignment found',
                status: 400
            },
            PROVIDER_ALREADY_ASSIGN: {
                message: 'Provider is already assigned',
                status: 400
            },
            PROVIDER_NOT_AVAILABLE: {
                message: 'Provider is not available',
                status: 400
            },
            SUCCESS: {
                message: 'success',
                status: 200
            },
            UNKNOWN_QUERY_PARAMS: {
                message: 'Unrecognized query params',
                status: 400
            },
            USER_EXISTS: {
                message: 'User Already exists',
                status: 400
            },
            validator: {
                BODY_NOT_EMPTY: 'request body should not empty'
            },
        }
    },
    prod: {
        en: {
            ASSIGNMENT_DOES_NOT_FALL_FOR_DOCTOR: {
                message: 'Assignment does not fall in user provider day/timmings',
                status: 400
            },
            ASSIGNMENT_DOES_NOT_FALL_FOR_SPECIALITY: {
                message: 'Assignment does not fall in practice day/timmings',
                status: 400
            },
            INTERNAL_SERVER_ERROR: {
                message: 'Internal server error',
                status: 500
            },
            INVALID_SESSION_TYPE: {
                message: 'Invalid session type',
                status: 400
            },
            INVALID_TOKEN: {
                message: 'Invalid Token',
                status: 400
            },
            NO_DOCTOR_FOUND: {
                message: 'No doctor exist for specified id',
                status: 400
            },
            NO_FACILITY_LOCATION_FOUND: {
                message: 'No facility location exist for specified id',
                status: 400
            },
            NO_RECORD_FOUND: {
                message: 'No record exists in the system.',
                status: 400
            },
            NO_SPECIALITY_ASSIGNMENT_FOUND: {
                message: 'No speciality assignment found',
                status: 400
            },
            PROVIDER_ALREADY_ASSIGN: {
                message: 'Provider is already assigned',
                status: 400
            },
            PROVIDER_NOT_AVAILABLE: {
                message: 'Provider is not available',
                status: 400
            },
            SUCCESS: {
                message: 'success',
                status: 200
            },
            UNKNOWN_QUERY_PARAMS: {
                message: 'Unrecognized query params',
                status: 400
            },
            USER_EXISTS: {
                message: 'User Already exists',
                status: 400
            },
            validator: {
                BODY_NOT_EMPTY: 'request body should not empty'
            },
        }
    },
    qa: {
        en: {
            ASSIGNMENT_DOES_NOT_FALL_FOR_DOCTOR: {
                message: 'Assignment does not fall in user provider day/timmings',
                status: 400
            },
            ASSIGNMENT_DOES_NOT_FALL_FOR_SPECIALITY: {
                message: 'Assignment does not fall in practice day/timmings',
                status: 400
            },
            INTERNAL_SERVER_ERROR: {
                message: 'Internal server error',
                status: 500
            },
            INVALID_SESSION_TYPE: {
                message: 'Invalid session type',
                status: 400
            },
            INVALID_TOKEN: {
                message: 'Invalid Token',
                status: 400
            },
            NO_DOCTOR_FOUND: {
                message: 'No doctor exist for specified id',
                status: 400
            },
            NO_FACILITY_LOCATION_FOUND: {
                message: 'No facility location exist for specified id',
                status: 400
            },
            NO_RECORD_FOUND: {
                message: 'No record exists in the system.',
                status: 400
            },
            NO_SPECIALITY_ASSIGNMENT_FOUND: {
                message: 'No speciality assignment found',
                status: 400
            },
            PROVIDER_ALREADY_ASSIGN: {
                message: 'Provider is already assigned',
                status: 400
            },
            PROVIDER_NOT_AVAILABLE: {
                message: 'Provider is not available',
                status: 400
            },
            SUCCESS: {
                message: 'success',
                status: 200
            },
            UNKNOWN_QUERY_PARAMS: {
                message: 'Unrecognized query params',
                status: 400
            },
            USER_EXISTS: {
                message: 'User Already exists',
                status: 400
            },
            validator: {
                BODY_NOT_EMPTY: 'request body should not empty'
            },
        }
    },
    staging: {
        en: {
            INTERNAL_SERVER_ERROR: {
                message: 'Internal server error',
                status: 500
            },
            INVALID_SESSION_TYPE: {
                message: 'Invalid session type',
                status: 400
            },
            NO_RECORD_FOUND: {
                message: 'No record exists in the system.',
                status: 400
            },
            NO_SPECIALITY_ASSIGNMENT_FOUND: {
                message: 'No speciality assignment found',
                status: 400
            },
            SUCCESS: {
                message: 'success',
                status: 200
            },
            validator: {
                BODY_NOT_EMPTY: 'request body should not empty'
            },
        }
    }
};
