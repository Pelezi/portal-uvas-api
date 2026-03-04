export namespace AnnouncementData {
  export interface AnnouncementOutput {
    id: number;
    title: string;
    description?: string | null;
    link?: string | null;
    desktopImageUrl?: string | null;
    mobileImageUrl?: string | null;
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
    description?: string;
    link?: string;
    startDate: string;
    endDate: string;
  }

  export interface UpdateAnnouncementInput {
    title?: string;
    description?: string | null;
    link?: string | null;
    startDate?: string;
    endDate?: string;
  }
}
