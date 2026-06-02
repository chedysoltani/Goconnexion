export declare enum AdType {
    COMPANY = "COMPANY",
    EVENT = "EVENT",
    SERVICE = "SERVICE"
}
export declare enum AdPlacement {
    FEED = "FEED",
    SIDEBAR = "SIDEBAR",
    TOP = "TOP"
}
export declare class CreateAdvertisementDto {
    title: string;
    description?: string;
    imageUrl?: string;
    targetUrl?: string;
    type: AdType;
    placement: AdPlacement;
    budget?: number;
    startDate?: string;
    endDate?: string;
}
export declare class UpdateAdvertisementDto {
    title?: string;
    description?: string;
    isActive?: boolean;
}
