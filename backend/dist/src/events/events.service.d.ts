import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
export declare class EventsService {
    private prisma;
    private notifications;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    findAll(filters?: {
        category?: string;
        type?: string;
        upcoming?: boolean;
    }): Promise<({
        _count: {
            registrations: number;
        };
        organizer: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        category: import("@prisma/client").$Enums.EventCategory;
        imageUrl: string | null;
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
    findOne(id: string): Promise<{
        _count: {
            registrations: number;
        };
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
            userId: string;
            status: import("@prisma/client").$Enums.RegistrationStatus;
            ticketCode: string;
            eventId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        category: import("@prisma/client").$Enums.EventCategory;
        imageUrl: string | null;
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
    create(userId: string, dto: CreateEventDto): Promise<{
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
        category: import("@prisma/client").$Enums.EventCategory;
        imageUrl: string | null;
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
    update(id: string, userId: string, dto: UpdateEventDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string;
        category: import("@prisma/client").$Enums.EventCategory;
        imageUrl: string | null;
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
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
    register(eventId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.RegistrationStatus;
        ticketCode: string;
        eventId: string;
    }>;
    cancelRegistration(eventId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.RegistrationStatus;
        ticketCode: string;
        eventId: string;
    }>;
    getMyRegistrations(userId: string): Promise<({
        event: {
            _count: {
                registrations: number;
            };
            organizer: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string;
            category: import("@prisma/client").$Enums.EventCategory;
            imageUrl: string | null;
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
        userId: string;
        status: import("@prisma/client").$Enums.RegistrationStatus;
        ticketCode: string;
        eventId: string;
    })[]>;
    getEventParticipants(eventId: string): Promise<({
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
        userId: string;
        status: import("@prisma/client").$Enums.RegistrationStatus;
        ticketCode: string;
        eventId: string;
    })[]>;
    sendUpcomingReminders(): Promise<void>;
}
