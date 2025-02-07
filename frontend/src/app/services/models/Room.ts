export interface Room {
    IdRoom: number;
    Name: string;
    TotalWorkspace: number;
    IdFloor: number;
    Square?: number;
    IdRoomStatus?: number;
    // IdFloorNavigation: Floor;
    // IdRoomStatusNavigation?: RoomStatus;
    // Workspaces: Workspace[];
}