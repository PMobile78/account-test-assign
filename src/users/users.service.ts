import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DeepPartial, Repository} from 'typeorm';
import {CreateUserDto} from './dto/create-user.dto';
import {User} from './user.entity';
import {Token} from '../token/token.entity';
import * as bcrypt from 'bcrypt';
import {UpdateUserDto} from "./dto/update-user.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Token)
        private readonly tokenRepository: Repository<Token>,
    ) {
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const salt = await bcrypt.genSalt();
        let password = createUserDto.password;
        const hash = await bcrypt.hash(password, salt);
        const user = new User();
        user.firstName = createUserDto.firstName;
        user.lastName = createUserDto.lastName;
        user.password_hash = hash;
        user.email = createUserDto.email;
        return this.usersRepository.save(user);
    }

    async update(updateUserDto: UpdateUserDto): Promise<User> {
        let user = await this.usersRepository.findOneBy({id: updateUserDto.id});
        if (!user) {
            throw new HttpException(`User ID ${updateUserDto.id} should exist before you can make any changes with it`, HttpStatus.NOT_FOUND);
        }
        user.firstName = updateUserDto.firstName
        user.lastName = updateUserDto.lastName
        return this.usersRepository.save(user)
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    findOne(id: number): Promise<User> {
        return this.usersRepository.findOneBy({id: id});
    }

    async remove(id: string): Promise<void> {
        await this.usersRepository.delete(id);
    }

    async findUserByToken(userId: number): Promise<User> {
        return this.usersRepository.findOneBy({id: userId});
    }
}