import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    findAll(category?: string, type?: string, upcoming?: string): Promise<({
        organizer: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
        _count: {
            registrations: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        imageUrl: string | null;
        category: import("@prisma/client").$Enums.EventCategory;
        type: import("@prisma/client").$Enums.EventType;
        startDate: Date;
        endDate: Date;
        location: string | null;
        virtualLink: string | null;
        capacity: number | null;
        price: number;
        isFree: boolean;
        isActive: boolean;
        organizerId: string;
    })[]>;
    getMyRegistrations(req: any): Promise<({
        event: {
            organizer: {
                id: string;
                firstName: string;
                lastName: string;
            };
            _count: {
                registrations: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string;
            imageUrl: string | null;
            category: import("@prisma/client").$Enums.EventCategory;
            type: import("@prisma/client").$Enums.EventType;
            startDate: Date;
            endDate: Date;
            location: string | null;
            virtualLink: string | null;
            capacity: number | null;
            price: number;
            isFree: boolean;
            isActive: boolean;
            organizerId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.RegistrationStatus;
        userId: string;
        ticketCode: string;
        eventId: string;
    })[]>;
    findOne(id: string): Promise<{
        organizer: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
        registrations: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.RegistrationStatus;
            userId: string;
            ticketCode: string;
            eventId: string;
        })[];
        _count: {
            registrations: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        imageUrl: string | null;
        category: import("@prisma/client").$Enums.EventCategory;
        type: import("@prisma/client").$Enums.EventType;
        startDate: Date;
        endDate: Date;
        location: string | null;
        virtualLink: string | null;
        capacity: number | null;
        price: number;
        isFree: boolean;
        isActive: boolean;
        organizerId: string;
    }>;
    getParticipants(id: string): Promise<({
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.RegistrationStatus;
        userId: string;
        ticketCode: string;
        eventId: string;
    })[]>;
    create(req: any, dto: CreateEventDto): Promise<{
        organizer: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        imageUrl: string | null;
        category: import("@prisma/client").$Enums.EventCategory;
        type: import("@prisma/client").$Enums.EventType;
        startDate: Date;
        endDate: Date;
        location: string | null;
        virtualLink: string | null;
        capacity: number | null;
        price: number;
        isFree: boolean;
        isActive: boolean;
        organizerId: string;
    }>;
    update(id: string, req: any, dto: UpdateEventDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        imageUrl: string | null;
        category: import("@prisma/client").$Enums.EventCategory;
        type: import("@prisma/client").$Enums.EventType;
        startDate: Date;
        endDate: Date;
        location: string | null;
        virtualLink: string | null;
        capacity: number | null;
        price: number;
        isFree: boolean;
        isActive: boolean;
        organizerId: string;
    }>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
    register(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.RegistrationStatus;
        userId: string;
        ticketCode: string;
        eventId: string;
    }>;
    cancelRegistration(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.RegistrationStatus;
        userId: string;
        ticketCode: string;
        eventId: string;
    }>;
}
