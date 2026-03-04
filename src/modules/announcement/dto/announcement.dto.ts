export namespace AnnouncementData {
  export interface AnnouncementOutput {
    id: number;
    title: string;
    link?: string | null;
    desktopImageUrl?: string | null;
    mobileImageUrl?: string | null;
    eventDate?: Date | null;
    eventEndDate?: Date | null;
    startDate: Date;
    endDate: Date;
    createdBy: {
      id: number;
      name: string;
    };
    createdAt: Date;
    updatedAt: Date;
  }

  export interface AnnouncementListFilterInput {
    limit?: number;
    isActive?: boolean;
  }

  export interface CreateAnnouncementInput {
    title: string;
    link?: string;
    eventDate?: string;
    eventEndDate?: string;
    startDate: string;
    endDate: string;
  }

  export interface UpdateAnnouncementInput {
    title?: string;
    link?: string | null;
    eventDate?: string | null;
    eventEndDate?: string | null;
    startDate?: string;
    endDate?: string;
  }
}
