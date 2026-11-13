export class ObstaclePool
{
    constructor (type, factory, capacity = 8)
    {
        this.type = type;
        this.available = [];
        this.active = [];

        for (let i = 0; i < capacity; i++)
        {
            const item = factory();

            item.deactivate();
            this.available.push(item);
        }
    }

    get ()
    {
        const item = this.available.pop();

        if (!item)
        {
            return null;
        }

        this.active.push(item);

        return item;
    }

    release (item)
    {
        const index = this.active.indexOf(item);

        if (index === -1)
        {
            return;
        }

        this.active.splice(index, 1);
        item.deactivate();
        this.available.push(item);
    }

    releaseAll ()
    {
        while (this.active.length > 0)
        {
            this.release(this.active[this.active.length - 1]);
        }
    }
}
