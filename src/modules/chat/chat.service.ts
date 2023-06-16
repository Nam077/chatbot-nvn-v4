import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { GoogleSheetService } from './google-sheet/google-sheet.service';

@Injectable()
export class ChatService {
    constructor(private readonly googleSheetService: GoogleSheetService) {}
    test() {
        return this.googleSheetService.getData();
    }
}
