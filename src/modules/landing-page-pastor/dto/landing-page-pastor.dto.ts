export namespace LandingPagePastorData {
  export interface CreateLandingPagePastorInput {
    memberId: number;
    order: number;
    descriptions: string[];
  }

  export interface UpdateLandingPagePastorInput {
    order?: number;
    descriptions?: string[];
  }

  export interface LandingPagePastorOutput {
    id: number;
    matrixId: number;
    memberId: number;
    order: number;
    descriptions: string[];
    member: {
      id: number;
      name: string;
      photoUrl?: string;
    };
    createdAt: Date;
    updatedAt: Date;
  }
}
