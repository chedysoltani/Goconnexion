export declare enum InviteMethod {
    EMAIL = "EMAIL",
    SMS = "SMS"
}
export declare class CreateBusinessCardInvitationDto {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    position?: string;
    inviteMethod: InviteMethod;
}
