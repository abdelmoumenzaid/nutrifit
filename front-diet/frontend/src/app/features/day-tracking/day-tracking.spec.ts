import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DayTrackingComponent } from './day-tracking';

describe('DayTrackingComponent', () => {
    let component: DayTrackingComponent;
    let fixture: ComponentFixture<DayTrackingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DayTrackingComponent]
        })
        .compileComponents();

        fixture = TestBed.createComponent(DayTrackingComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
