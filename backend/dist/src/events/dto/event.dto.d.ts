export declare enum EventCategory {
    NETWORKING = "NETWORKING",
    STARTUP = "STARTUP",
    INVESTISSEMENT = "INVESTISSEMENT",
    FORMATION = "FORMATION",
    INCUBATEUR = "INCUBATEUR"
}
export declare enum EventType {
    PHYSICAL = "PHYSICAL",
    VIRTUAL = "VIRTUAL"
}
export declare class CreateEventDto {
    title: string;
    description: string;
    category: EventCategory;
    type: EventType;
    startDate: string;
    endDate: string;
    location?: string;
    virtualLink?: string;
    capacity?: number;
    price?: number;
    isFree?: boolean;
    imageUrl?: string;
}
export declare class UpdateEventDto {
    title?: string;
    description?: string;
    category?: EventCategory;
    type?: EventType;
    startDate?: string;
    endDate?: string;
    location?: string;
    virtualLink?: string;
    capacity?: number;
    price?: number;
    isFree?: boolean;
    imageUrl?: string;
    isActive?: boolean;
}
